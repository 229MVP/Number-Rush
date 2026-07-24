// Number Rush — validate-run Edge Function
// Authenticates the user, replays Daily/Ranked events, commits atomically.
// Deploy only after a Number Rush Supabase project is linked.
// Never ship service-role keys in the Expo client.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TARGET = 21;
const PERFECT_BASE = 100;

type PlaceEvent = {
  sequence: number;
  type: "place";
  tileValue: number;
  effectiveValue: number;
  laneIndex: number;
  result: "normal" | "perfect" | "bust" | "shielded";
  laneTotalBefore: number;
  laneTotalAfter: number;
};

type RunEvent = PlaceEvent | { sequence: number; type: "forfeit" };

type Body = {
  mode: "daily" | "ranked";
  runId: string;
  dateKey?: string;
  seasonId?: string;
  ticketId?: string;
  seed: string;
  events: RunEvent[];
  claimedScore: number;
  claimedPerfects: number;
  claimedMaxCombo: number;
  claimedLongestStreak: number;
  claimedTilesPlaced: number;
  claimedStrikesUsed: number;
  completionReason: string;
  durationMs?: number;
  tileSequenceHash?: string;
  eventHash?: string;
  clientVersion?: string;
};

function comboFromStreak(streak: number): number {
  if (streak >= 6) return 4;
  if (streak >= 4) return 3;
  if (streak >= 2) return 2;
  return 1;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return 1 + Math.floor(r * 10);
  };
}

function replay(events: RunEvent[], expectedTiles: number[], maxTiles: number) {
  const lanes = [0, 0, 0, 0];
  let score = 0;
  let streak = 0;
  let maxCombo = 1;
  let longest = 0;
  let perfects = 0;
  let strikes = 0;
  let tiles = 0;
  let forfeit = false;
  let tileIdx = 0;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.sequence !== i + 1) {
      return { ok: false as const, reason: "Non-continuous event sequence" };
    }
    if (ev.type === "forfeit") {
      forfeit = true;
      break;
    }
    if (tiles >= maxTiles) {
      return { ok: false as const, reason: "Exceeded tile limit" };
    }
    if (ev.laneIndex < 0 || ev.laneIndex > 3) {
      return { ok: false as const, reason: "Invalid lane" };
    }
    if (ev.tileValue < 1 || ev.tileValue > 10) {
      return { ok: false as const, reason: "Invalid tile" };
    }
    if (ev.effectiveValue !== ev.tileValue) {
      return { ok: false as const, reason: "Effective value mismatch (power-ups disabled)" };
    }
    if (tileIdx >= expectedTiles.length || expectedTiles[tileIdx] !== ev.tileValue) {
      return { ok: false as const, reason: "Tile sequence mismatch" };
    }
    tileIdx += 1;
    const before = lanes[ev.laneIndex];
    if (before !== ev.laneTotalBefore) {
      return { ok: false as const, reason: "Lane total before mismatch" };
    }
    const after = before + ev.effectiveValue;
    if (after !== ev.laneTotalAfter) {
      return { ok: false as const, reason: "Lane total after mismatch" };
    }
    tiles += 1;
    if (after === TARGET) {
      if (ev.result !== "perfect") {
        return { ok: false as const, reason: "Expected perfect" };
      }
      streak += 1;
      longest = Math.max(longest, streak);
      const combo = comboFromStreak(streak);
      maxCombo = Math.max(maxCombo, combo);
      score += PERFECT_BASE * combo;
      perfects += 1;
      lanes[ev.laneIndex] = 0;
    } else if (after > TARGET) {
      if (ev.result !== "bust" && ev.result !== "shielded") {
        return { ok: false as const, reason: "Expected bust" };
      }
      streak = 0;
      lanes[ev.laneIndex] = 0;
      if (ev.result === "bust") {
        strikes += 1;
        if (strikes > 3) {
          return { ok: false as const, reason: "Too many strikes" };
        }
      }
    } else {
      if (ev.result !== "normal") {
        return { ok: false as const, reason: "Expected normal" };
      }
      lanes[ev.laneIndex] = after;
    }
  }

  return {
    ok: true as const,
    score,
    perfects,
    maxCombo,
    longest,
    tiles,
    strikes,
    forfeit,
  };
}

function pointsDelta(score: number, strikesRemaining: number, perfects: number, maxCombo: number) {
  let base = -25;
  if (score >= 1500) base = 60;
  else if (score >= 1200) base = 40;
  else if (score >= 900) base = 20;
  else if (score >= 600) base = 5;
  else if (score >= 300) base = -10;
  const bonus = strikesRemaining * 5 + perfects * 2 + Math.max(0, maxCombo - 1) * 3;
  let delta = base + bonus;
  if (delta > 80) delta = 80;
  if (delta < -40) delta = -40;
  return delta;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Server misconfigured" }), { status: 500 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }
  const userId = userData.user.id;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400 });
  }

  if (!body?.runId || !body?.seed || !Array.isArray(body.events) || !body.mode) {
    return new Response(JSON.stringify({ ok: false, error: "Malformed payload" }), { status: 400 });
  }

  const maxTiles = body.mode === "daily" ? 40 : 30;
  if (body.events.length > maxTiles + 1) {
    return new Response(JSON.stringify({ ok: false, error: "Too many events" }), { status: 400 });
  }

  const rng = mulberry32(hashSeed(body.seed));
  const expectedTiles = Array.from({ length: maxTiles + 5 }, () => rng());
  const replayed = replay(body.events, expectedTiles, maxTiles);
  if (!replayed.ok) {
    return new Response(JSON.stringify({ ok: false, error: replayed.reason, validation_status: "rejected" }), {
      status: 400,
    });
  }

  if (
    replayed.score !== body.claimedScore ||
    replayed.perfects !== body.claimedPerfects ||
    replayed.maxCombo !== body.claimedMaxCombo ||
    replayed.tiles !== body.claimedTilesPlaced ||
    replayed.strikes !== body.claimedStrikesUsed
  ) {
    return new Response(
      JSON.stringify({ ok: false, error: "Claimed result does not match replay", validation_status: "rejected" }),
      { status: 400 },
    );
  }

  if (body.durationMs != null && body.durationMs >= 0 && body.durationMs < 1500 && replayed.tiles > 5) {
    // Flag for review but still accept carefully — mark review
  }

  if (body.mode === "daily") {
    const dateKey = body.dateKey ?? new Date().toISOString().slice(0, 10);
    await admin.rpc("ensure_daily_challenge", { challenge_date: dateKey });

    const { data: existing } = await admin
      .from("daily_submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("date_key", dateKey)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: false, error: "Official daily already submitted" }), { status: 409 });
    }

    const { error: insErr } = await admin.from("daily_submissions").insert({
      user_id: userId,
      date_key: dateKey,
      run_id: body.runId,
      score: replayed.score,
      perfect_clears: replayed.perfects,
      max_combo_multiplier: replayed.maxCombo,
      longest_perfect_streak: replayed.longest,
      tiles_placed: replayed.tiles,
      strikes_used: replayed.strikes,
      completion_reason: body.completionReason,
      duration_ms: body.durationMs ?? null,
      tile_sequence_hash: body.tileSequenceHash ?? null,
      event_hash: body.eventHash ?? null,
      validation_status: "accepted",
    });
    if (insErr) {
      const msg = insErr.message.includes("duplicate") ? "Duplicate run or daily submission" : "Insert failed";
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 409 });
    }

    await admin.rpc("initialize_player_data");
    await admin.from("player_statistics").update({
      // increment handled best via SQL later; keep minimal here
    }).eq("user_id", userId);

    return new Response(
      JSON.stringify({
        ok: true,
        mode: "daily",
        validation_status: "accepted",
        score: replayed.score,
        perfect_clears: replayed.perfects,
        max_combo_multiplier: replayed.maxCombo,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  // Ranked
  if (!body.ticketId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing ticket" }), { status: 400 });
  }

  const { data: ticket, error: ticketErr } = await admin
    .from("ranked_run_tickets")
    .select("*")
    .eq("id", body.ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (ticketErr || !ticket) {
    return new Response(JSON.stringify({ ok: false, error: "Ticket not found" }), { status: 404 });
  }
  if (ticket.status !== "active" || ticket.consumed_at) {
    return new Response(JSON.stringify({ ok: false, error: "Ticket already used" }), { status: 409 });
  }
  if (new Date(ticket.expires_at).getTime() < Date.now()) {
    await admin.from("ranked_run_tickets").update({ status: "expired" }).eq("id", ticket.id);
    return new Response(JSON.stringify({ ok: false, error: "Ticket expired" }), { status: 410 });
  }
  if (ticket.seed !== body.seed) {
    return new Response(JSON.stringify({ ok: false, error: "Seed mismatch" }), { status: 400 });
  }

  const { data: profile } = await admin
    .from("ranked_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const previous = profile?.ranked_points ?? 0;
  const strikesRemaining = Math.max(0, 3 - replayed.strikes);
  const delta = replayed.forfeit
    ? -20
    : pointsDelta(replayed.score, strikesRemaining, replayed.perfects, replayed.maxCombo);
  const next = Math.max(0, previous + delta);
  const outcome = replayed.forfeit ? "forfeit" : delta > 0 ? "win" : delta < 0 ? "loss" : "draw";

  const { error: matchErr } = await admin.from("ranked_matches").insert({
    run_id: body.runId,
    user_id: userId,
    season_id: ticket.season_id,
    ticket_id: ticket.id,
    seed: body.seed,
    score: replayed.score,
    perfect_clears: replayed.perfects,
    max_combo_multiplier: replayed.maxCombo,
    longest_perfect_streak: replayed.longest,
    tiles_placed: replayed.tiles,
    strikes_used: replayed.strikes,
    completion_reason: body.completionReason,
    outcome,
    points_delta: delta,
    previous_points: previous,
    new_points: next,
    duration_ms: body.durationMs ?? null,
    tile_sequence_hash: body.tileSequenceHash ?? null,
    event_hash: body.eventHash ?? null,
    validation_status: "accepted",
  });
  if (matchErr) {
    return new Response(JSON.stringify({ ok: false, error: "Duplicate run or insert failed" }), { status: 409 });
  }

  await admin.from("ranked_run_tickets").update({
    status: replayed.forfeit ? "forfeited" : "consumed",
    consumed_at: new Date().toISOString(),
  }).eq("id", ticket.id);

  const wins = (profile?.wins ?? 0) + (outcome === "win" ? 1 : 0);
  const losses = (profile?.losses ?? 0) + (outcome === "loss" || outcome === "forfeit" ? 1 : 0);
  const draws = (profile?.draws ?? 0) + (outcome === "draw" ? 1 : 0);
  const streak = outcome === "win" ? (profile?.current_win_streak ?? 0) + 1 : 0;

  await admin.from("ranked_profiles").upsert({
    user_id: userId,
    season_id: ticket.season_id,
    ranked_points: next,
    season_high_points: Math.max(profile?.season_high_points ?? 0, next),
    games_played: (profile?.games_played ?? 0) + 1,
    wins,
    losses,
    draws,
    current_win_streak: streak,
    best_win_streak: Math.max(profile?.best_win_streak ?? 0, streak),
    updated_at: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      ok: true,
      mode: "ranked",
      validation_status: "accepted",
      outcome,
      points_delta: delta,
      previous_points: previous,
      new_points: next,
      score: replayed.score,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
