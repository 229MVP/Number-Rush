import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

test("package.json has required scripts and deps", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const script of ["dev", "build", "start", "typecheck", "test"]) {
    assert.ok(pkg.scripts[script], `missing script: ${script}`);
  }
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.match(pkg.dependencies.next, /15/);
  assert.match(pkg.dependencies.react, /19/);
  assert.ok(pkg.dependencies["@supabase/supabase-js"]);
  assert.ok(pkg.dependencies["@supabase/ssr"]);
  assert.ok(pkg.devDependencies.typescript);
});

test(".env.example exposes only public Supabase keys", () => {
  const env = read(".env.example");
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  // No service-role assignment — warning comments are fine.
  assert.doesNotMatch(env, /^\s*SUPABASE_SERVICE_ROLE_KEY\s*=/m);
  assert.doesNotMatch(env, /^\s*NEXT_PUBLIC_.*SERVICE/m);
});

test("supabase clients never use service role keys", () => {
  for (const file of [
    "lib/supabase/client.ts",
    "lib/supabase/server.ts",
    "lib/supabase/middleware.ts",
  ]) {
    const src = read(file);
    assert.doesNotMatch(src, /SERVICE_ROLE_KEY/, file);
    assert.match(src, /NEXT_PUBLIC_SUPABASE_ANON_KEY/, file);
  }
  const mw = read("middleware.ts");
  assert.doesNotMatch(mw, /SERVICE_ROLE_KEY/);
  assert.match(mw, /updateSession/);
});
test("required app routes exist", () => {
  const paths = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/login/page.tsx",
    "app/unauthorized/page.tsx",
    "app/(dashboard)/remote-config/page.tsx",
    "app/(dashboard)/seasons/page.tsx",
    "app/(dashboard)/events/page.tsx",
    "app/(dashboard)/announcements/page.tsx",
    "app/(dashboard)/leaderboards/page.tsx",
    "app/(dashboard)/anti-cheat/page.tsx",
    "app/(dashboard)/player-support/page.tsx",
    "app/(dashboard)/economy/page.tsx",
    "app/(dashboard)/feature-flags/page.tsx",
    "app/(dashboard)/release-status/page.tsx",
    "app/(dashboard)/audit-log/page.tsx",
    "lib/auth/requireOperator.ts",
    "README.md",
  ];
  for (const p of paths) {
    assert.ok(existsSync(join(root, p)), `missing ${p}`);
  }
});

test("requireOperator documents RLS denial for non-operators", () => {
  const src = read("lib/auth/requireOperator.ts");
  assert.match(src, /RLS/);
  assert.match(src, /operator_roles/);
});
