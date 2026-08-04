#!/usr/bin/env node
/**
 * Release-candidate validator — reports blockers without printing secrets.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

function readJson(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function fail(msg) {
  failures.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

const appJson = readJson('app.json');
const pkg = readJson('package.json');
const envExample = fs.existsSync(path.join(root, '.env.example'))
  ? fs.readFileSync(path.join(root, '.env.example'), 'utf8')
  : '';

if (!pkg?.version) fail('package.json missing version');
if (appJson?.expo?.android && !appJson.expo.android.package) {
  fail('android.package is MISSING');
}
if (appJson?.expo?.ios && !appJson.expo.ios.bundleIdentifier) {
  fail('ios.bundleIdentifier is MISSING');
}

if (envExample.includes('SERVICE_ROLE') || envExample.includes('service_role')) {
  fail('.env.example must not document service-role keys for Expo');
}

const privacy = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || '';
const terms = process.env.EXPO_PUBLIC_TERMS_URL || '';
if (!privacy) warn('EXPO_PUBLIC_PRIVACY_POLICY_URL unset');
if (!terms) warn('EXPO_PUBLIC_TERMS_URL unset');

const freezeMigration = fs.readFileSync(
  path.join(root, 'supabase/migrations/0004_player_inventory.sql'),
  'utf8',
);
if (!freezeMigration.includes('"freeze"')) {
  fail('0004_player_inventory.sql must quote reserved freeze column');
}

const adminEnv = path.join(root, 'admin/.env.example');
if (fs.existsSync(adminEnv)) {
  const adminText = fs.readFileSync(adminEnv, 'utf8');
  if (/^\s*[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\s*=/im.test(adminText)) {
    fail('admin/.env.example must not assign service-role keys');
  }
} else {
  warn('admin/.env.example missing');
}

console.log('Number Rush — Release Candidate validation');
for (const w of warnings) console.log(`WARN  ${w}`);
for (const f of failures) console.log(`FAIL  ${f}`);
if (failures.length === 0) {
  console.log('RESULT: no hard FAIL items (warnings may remain)');
  process.exit(0);
}
console.log(`RESULT: ${failures.length} FAIL item(s)`);
process.exit(1);
