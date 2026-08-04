// Number Rush — liveops-admin Edge Function
// Authenticates the caller, verifies operator_roles, serves Live Ops admin reads.
// Service-role key stays on the Edge runtime only — never ship it to the admin UI.
// Never log secrets (tokens, keys, Authorization headers).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Empty aggregates — no fabricated LIVE metrics. */
function emptyOverviewAggregates() {
  return {
    seasons: { active: null, count: 0 },
    events: { active: 0, scheduled: 0 },
    announcements: { published: 0 },
    antiCheat: { openReviews: 0 },
    support: { openCases: 0 },
    economy: { publishedVersion: null },
    remoteConfig: { publishedVersion: null },
    audit: { recentCount: 0 },
  };
}

function routePath(pathname: string): string {
  // /functions/v1/liveops-admin[/...] or /liveops-admin[/...]
  const trimmed = pathname.replace(/\/+$/, "");
  const marker = "/liveops-admin";
  const idx = trimmed.lastIndexOf(marker);
  if (idx === -1) return "/";
  const rest = trimmed.slice(idx + marker.length);
  return rest === "" ? "/" : rest;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ ok: false, error: "Server misconfigured" }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  // Privileged role check — service role stays server-side.
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: roles, error: roleErr } = await admin
    .from("operator_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("active", true);

  if (roleErr) {
    console.error("operator_roles lookup failed");
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  if (!roles || roles.length === 0) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  const url = new URL(req.url);
  const path = routePath(url.pathname);

  if (req.method === "GET" && (path === "/overview" || path === "/")) {
    return json({
      ok: true,
      resource: "overview",
      aggregates: emptyOverviewAggregates(),
    });
  }

  return json({ ok: false, error: "Not found" }, 404);
});
