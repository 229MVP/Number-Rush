// Number Rush — RevenueCat webhook (IAP fulfillment + refunds)
// Authorization: Bearer REVENUECAT_WEBHOOK_AUTH_SECRET
// Idempotent by store_transaction_id and revenuecat event id.
// Never grants unknown/disabled products (see apply_purchase_fulfillment RPC).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const KNOWN_PRODUCTS = new Set([
  "gems_80",
  "gems_450",
  "gems_1000",
  "gems_2500",
  "starter_bundle",
  "remove_ads",
  "numberrush.gems_80",
  "numberrush.gems_450",
  "numberrush.gems_1000",
  "numberrush.gems_2500",
  "numberrush.starter_bundle",
  "numberrush.remove_ads",
  "numberrush.club.monthly",
  "numberrush.club.annual",
]);

type RcEvent = {
  id?: string;
  type?: string;
  environment?: string;
  app_user_id?: string;
  product_id?: string;
  transaction_id?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  store?: string;
};

type RcBody = {
  api_version?: string;
  event?: RcEvent;
};

function bearerAuthorized(req: Request): boolean {
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_AUTH_SECRET") ?? "";
  if (!secret) return false;
  const header = req.headers.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token === secret;
}

function mapEnvironment(env?: string): string {
  if (!env) return "UNKNOWN";
  return env.toUpperCase();
}

function isSandbox(env: string): boolean {
  return env === "SANDBOX" || env === "TEST";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
  }

  if (!bearerAuthorized(req)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Server misconfigured" }), { status: 500 });
  }

  const allowSandbox = (Deno.env.get("REVENUECAT_ALLOW_SANDBOX") ?? "true").toLowerCase() !== "false";
  const productionOnly = (Deno.env.get("REVENUECAT_PRODUCTION_ONLY") ?? "false").toLowerCase() === "true";

  let body: RcBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400 });
  }

  const event = body.event;
  if (!event?.type) {
    return new Response(JSON.stringify({ ok: false, error: "Missing event" }), { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const env = mapEnvironment(event.environment);
  if (productionOnly && isSandbox(env)) {
    return new Response(JSON.stringify({ ok: true, skipped: "sandbox_ignored" }), { status: 200 });
  }
  if (!allowSandbox && isSandbox(env)) {
    return new Response(JSON.stringify({ ok: true, skipped: "sandbox_disabled" }), { status: 200 });
  }

  const productId = event.product_id ?? "";
  const storeTxn = event.transaction_id ?? event.id ?? "";
  const rcEventId = event.id ?? null;
  const userId = event.app_user_id ?? "";

  if (!userId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing app_user_id" }), { status: 400 });
  }

  const purchasedAt = event.purchased_at_ms
    ? new Date(event.purchased_at_ms).toISOString()
    : null;
  const clubExpiration = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  const eventType = event.type.toUpperCase();

  if (eventType === "REFUND" || eventType === "CANCELLATION") {
    if (!storeTxn) {
      return new Response(JSON.stringify({ ok: false, error: "Missing transaction_id for refund" }), {
        status: 400,
      });
    }
    const { data, error } = await admin.rpc("record_purchase_refund", {
      p_store_transaction_id: storeTxn,
      p_revenuecat_event_id: rcEventId,
      p_refund_reason: eventType,
    });
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify({ ok: true, action: "refund", purchase: data }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const fulfillTypes = new Set([
    "INITIAL_PURCHASE",
    "NON_RENEWING_PURCHASE",
    "RENEWAL",
    "PRODUCT_CHANGE",
  ]);

  if (!fulfillTypes.has(eventType)) {
    return new Response(JSON.stringify({ ok: true, skipped: eventType }), { status: 200 });
  }

  if (!KNOWN_PRODUCTS.has(productId)) {
    console.warn("Rejected unknown product", productId, eventType);
    return new Response(JSON.stringify({ ok: false, error: "Unknown product", product_id: productId }), {
      status: 422,
    });
  }

  if (!storeTxn) {
    return new Response(JSON.stringify({ ok: false, error: "Missing store transaction id" }), {
      status: 400,
    });
  }

  const purchaseKind = productId.startsWith("gems_") ? "consumable" : "non_consumable";

  const { data, error } = await admin.rpc("apply_purchase_fulfillment", {
    p_store_transaction_id: storeTxn,
    p_revenuecat_event_id: rcEventId,
    p_user_id: userId,
    p_product_id: productId,
    p_purchase_kind: purchaseKind,
    p_environment: env,
    p_purchased_at: purchasedAt,
    p_raw_event_reference: `${eventType}:${rcEventId ?? storeTxn}`,
    p_status: "completed",
    p_club_expiration: clubExpiration,
  });

  if (error) {
    const duplicate = error.message.includes("already") || error.message.includes("duplicate");
    return new Response(
      JSON.stringify({ ok: duplicate, error: error.message }),
      { status: duplicate ? 200 : 400 },
    );
  }

  return new Response(JSON.stringify({ ok: true, action: "fulfill", purchase: data }), {
    headers: { "Content-Type": "application/json" },
  });
});
