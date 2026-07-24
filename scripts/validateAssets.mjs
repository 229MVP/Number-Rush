#!/usr/bin/env node
/**
 * Validates core Expo assets for Number Rush beta builds.
 * Always exits 0 and prints a report (warnings for missing store screenshots / splash wiring).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const requiredFiles = [
  { key: 'icon', rel: 'assets/icon.png' },
  { key: 'adaptiveForeground', rel: 'assets/android-icon-foreground.png' },
  { key: 'adaptiveBackground', rel: 'assets/android-icon-background.png' },
  { key: 'adaptiveMonochrome', rel: 'assets/android-icon-monochrome.png' },
  { key: 'splash', rel: 'assets/splash-icon.png' },
  { key: 'favicon', rel: 'assets/favicon.png' },
];

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readAppJson() {
  try {
    const raw = fs.readFileSync(path.join(root, 'app.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const report = {
  present: [],
  missing: [],
  warnings: [],
  blockers: [],
};

for (const item of requiredFiles) {
  if (exists(item.rel)) {
    report.present.push(item.rel);
  } else {
    report.missing.push(item.rel);
  }
}

const appJson = readAppJson();
const expo = appJson?.expo ?? {};

if (
  !expo.splash?.image &&
  !expo.plugins?.some?.((p) => {
    if (typeof p === 'string') return p.includes('splash');
    return Array.isArray(p) && String(p[0]).includes('splash');
  })
) {
  report.warnings.push(
    'Splash image file may exist, but expo.splash (or splash plugin) is not wired in app.json.',
  );
}

if (!expo.android?.package) {
  report.blockers.push('android.package is MISSING in app.json (do not invent here).');
}
if (!expo.ios?.bundleIdentifier) {
  report.blockers.push('ios.bundleIdentifier is MISSING in app.json (do not invent here).');
}

const shotDir = path.join(root, 'assets/store-screenshots');
let shotCount = 0;
if (fs.existsSync(shotDir)) {
  shotCount = fs
    .readdirSync(shotDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).length;
}
if (shotCount === 0) {
  report.warnings.push(
    'No store screenshots found in assets/store-screenshots/ (see docs/store-screenshot-plan.md).',
  );
} else {
  report.present.push(`assets/store-screenshots/* (${shotCount} images)`);
}

const designRef = path.join(root, 'design_reference');
if (!fs.existsSync(designRef)) {
  report.warnings.push('design_reference/ missing — should be preserved.');
} else {
  report.present.push('design_reference/');
}

console.log('Number Rush — asset validation report');
console.log('=====================================');
console.log(`Core assets present: ${report.present.length}`);
report.present.forEach((p) => console.log(`  ✓ ${p}`));
if (report.missing.length) {
  console.log('Missing required files:');
  report.missing.forEach((p) => console.log(`  ✗ ${p}`));
}
if (report.blockers.length) {
  console.log('Blockers:');
  report.blockers.forEach((b) => console.log(`  ! ${b}`));
}
if (report.warnings.length) {
  console.log('Warnings:');
  report.warnings.forEach((w) => console.log(`  ~ ${w}`));
}
console.log('=====================================');
console.log(
  report.missing.length === 0
    ? 'Result: core asset files OK (exit 0). Resolve blockers/warnings before store submit.'
    : 'Result: some core files missing (exit 0 with report — fix before release).',
);

process.exit(0);
