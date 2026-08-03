// Number Rush — AdMob rewarded ad server-side verification (SSV) callback
// GET with query parameters; verifies ECDSA signature via Google public keys (Web Crypto).
// Deploy only after migrations 0016–0021 and AdMob SSV URL configuration.
//
// Production readiness: validate end-to-end with Google AdMob "Ad unit testing" / SSV test tool
// before enabling real rewards. Set ADMOB_SSV_STRICT=true in production.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMOB_KEYS_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
const KEYS_TTL_MS = 60 * 60 * 1000;

type AdMobKey = { keyId: number; pem: string; base64?: string };

let cachedKeys: { fetchedAt: number; keys: Map<number, CryptoKey> } | null = null;

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

async function loadAdMobKeys(): Promise<Map<number, CryptoKey>> {
  const now = Date.now();
  if (cachedKeys && now - cachedKeys.fetchedAt < KEYS_TTL_MS) {
    return cachedKeys.keys;
  }

  const res = await fetch(ADMOB_KEYS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch AdMob verifier keys: ${res.status}`);
  }

  const body = (await res.json()) as { keys?: AdMobKey[] };
  const map = new Map<number, CryptoKey>();

  for (const entry of body.keys ?? []) {
    const spki = pemToArrayBuffer(entry.pem);
    const key = await crypto.subtle.importKey(
      "spki",
      spki,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    map.set(Number(entry.keyId), key);
  }

  cachedKeys = { fetchedAt: now, keys: map };
  return map;
}

function buildAdMobMessage(params: URLSearchParams): string {
  const pairs: string[] = [];
  const keys = [...params.keys()].filter((k) => k !== "signature" && k !== "key_id").sort();
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null) {
      pairs.push(`${key}=${value}`);
    }
  }
  return pairs.join("&");
}

function base64UrlToBytes(input: string): Uint8Array {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function verifyAdMobSignature(params: URLSearchParams): Promise<boolean> {
  const signature = params.get("signature");
  const keyIdRaw = params.get("key_id");
  if (!signature || !keyIdRaw) return false;

  const keyId = Number(keyIdRaw);
  const keys = await loadAdMobKeys();
  const publicKey = keys.get(keyId);
  if (!publicKey) return false;

  const message = buildAdMobMessage(params);
  const data = new TextEncoder().encode(message);
  const sigBytes = base64UrlToBytes(signature);

  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    sigBytes,
    data,
  );
}

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Server misconfigured" }), { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const url = new URL(req.url);
  const params = url.searchParams;

  const strict = (Deno.env.get("ADMOB_SSV_STRICT") ?? "true").toLowerCase() !== "false";
  const allowBypass = (Deno.env.get("ADMOB_SSV_ALLOW_UNVERIFIED") ?? "false").toLowerCase() === "true";

  let signatureOk = false;
  try {
    signatureOk = await verifyAdMobSignature(params);
  } catch (e) {
    console.error("AdMob key load/verify error", e);
    signatureOk = false;
  }

  if (!signatureOk && strict && !allowBypass) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), { status: 401 });
  }

  const transactionId = params.get("transaction_id") ?? "";
  const userId = params.get("user_id") ?? "";
  const rewardItem = params.get("reward_item") ?? "";
  const rewardAmount = Number(params.get("reward_amount") ?? "0");
  const customDataRaw = params.get("custom_data") ?? "";
  const placement = params.get("ad_unit") ?? params.get("placement") ?? "unknown";

  let opportunityId = customDataRaw;
  let customData: Record<string, unknown> | null = null;
  if (customDataRaw) {
    try {
      const parsed = JSON.parse(customDataRaw);
      customData = parsed;
      if (typeof parsed === "object" && parsed && "opportunity_id" in parsed) {
        opportunityId = String((parsed as { opportunity_id: string }).opportunity_id);
      }
    } catch {
      customData = { raw: customDataRaw };
    }
  }

  if (!transactionId || !userId || !rewardItem || !Number.isFinite(rewardAmount)) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required query parameters" }), {
      status: 400,
    });
  }

  const { data, error } = await admin.rpc("apply_verified_ad_reward", {
    p_admob_transaction_id: transactionId,
    p_user_id: userId,
    p_placement: placement,
    p_opportunity_id: opportunityId,
    p_reward_item: rewardItem,
    p_reward_amount: Math.trunc(rewardAmount),
    p_custom_data: customData,
  });

  if (error) {
    const status = error.message.includes("duplicate") ? 200 : 400;
    return new Response(
      JSON.stringify({ ok: false, error: error.message, verification_status: "error" }),
      { status },
    );
  }

  const row = data as { verification_status?: string };
  return new Response(
    JSON.stringify({
      ok: row.verification_status === "verified",
      verification_status: row.verification_status,
      signature_verified: signatureOk,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
