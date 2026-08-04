#!/usr/bin/env node
/**
 * Captures real screenshots from the exported web build for marketplace use.
 * Run: node scripts/captureScreenshots.mjs
 * Requires: `npx expo export --platform web` already run, dist/ served at BASE_URL.
 * Not part of the shipped app — dev tooling only.
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:8756';
const OUT_DIR = path.resolve('screenshots');
const CHROME_PATH = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

fs.mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForTestId(page, testId, timeout = 15000) {
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout });
}

async function waitForFonts(page) {
  await page
    .evaluate(() => document.fonts && document.fonts.ready)
    .catch(() => {});
}

async function tapTestId(page, testId) {
  // Dispatch a real click event directly on the node — more reliable than
  // Puppeteer's built-in click for RN Web elements under animated transforms.
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 10000 });
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) throw new Error(`tapTestId: not found ${id}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, testId);
}

async function readLaneState(page) {
  return page.evaluate(() => {
    // Lane testIDs are 1-indexed ("lane-1".."lane-4"); sort numerically.
    const lanes = Array.from(
      document.querySelectorAll('[data-testid^="lane-"]'),
    ).sort((a, b) => {
      const na = Number.parseInt(a.getAttribute('data-testid').split('-')[1], 10);
      const nb = Number.parseInt(b.getAttribute('data-testid').split('-')[1], 10);
      return na - nb;
    });
    // Card text order is "LANE {id}", then the total, then optional "need {n}".
    // Take the second digit run so the lane-number badge isn't mistaken for the total.
    const totals = lanes.map((el) => {
      const text = el.textContent || '';
      const matches = text.match(/\d+/g) || [];
      return matches.length > 1 ? Number.parseInt(matches[1], 10) : 0;
    });
    const currentEl = document.querySelector('[data-testid="current-tile"]');
    const currentText = currentEl ? currentEl.textContent || '' : '';
    const currentMatch = currentText.match(/\d+/);
    const currentValue = currentMatch ? Number.parseInt(currentMatch[0], 10) : null;
    return { totals, currentValue, laneCount: lanes.length };
  });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  const shots = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 01 — Splash
    await waitForTestId(page, 'splash-screen', 15000);
    await sleep(500);
    await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '01-splash.png') });
    shots.push('01-splash.png');

    await tapTestId(page, 'splash-start');

    // 02 — Main Menu
    await waitForTestId(page, 'main-menu', 20000);
    await sleep(500);
    await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '02-main-menu.png') });
    shots.push('02-main-menu.png');

    // Start Classic run
    await tapTestId(page, 'menu-play');
    await waitForTestId(page, 'gameplay-screen', 15000);
    await sleep(600);

    // 06 — Tutorial (first run should show it)
    const hasTutorial = await page
      .waitForSelector('[data-testid="tutorial-spotlight"]', { timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (hasTutorial) {
      await sleep(300);
      await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '06-tutorial.png') });
      shots.push('06-tutorial.png');
      // Skip through tutorial
      const skipBtn = await page.$('[data-testid="tutorial-skip"]');
      if (skipBtn) await skipBtn.click();
    }
    await sleep(500);

    // 03 — Gameplay (clean state)
    await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '03-gameplay.png') });
    shots.push('03-gameplay.png');

    // Phase 1 — play conservatively (never intentionally bust) until a Perfect lands.
    let perfectCaptured = false;
    for (let attempt = 0; attempt < 150 && !perfectCaptured; attempt += 1) {
      const gameOver = await page.$('[data-testid="game-over-screen"]');
      if (gameOver) break;
      const state = await readLaneState(page);
      if (state.currentValue == null || state.laneCount === 0) {
        await sleep(250);
        continue;
      }

      let laneIndex = state.totals.findIndex(
        (t) => t + state.currentValue === 21,
      );
      if (laneIndex === -1) {
        // Never risk a bust here — pick the safest (or least-bad if forced) lane.
        let best = 0;
        let bestScore = Infinity;
        state.totals.forEach((t, i) => {
          const next = t + state.currentValue;
          const overflow = next > 21 ? next - 21 : 0;
          const score = overflow > 0 ? 1000 + overflow : 21 - next;
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        });
        laneIndex = best;
      }

      const willBePerfect = state.totals[laneIndex] + state.currentValue === 21;
      await tapTestId(page, `lane-${laneIndex + 1}`);
      await sleep(willBePerfect ? 500 : 320);

      if (willBePerfect) {
        await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '04-perfect.png') });
        shots.push('04-perfect.png');
        perfectCaptured = true;
        await sleep(500);
      }
    }

    // Phase 2 — deliberately overflow a lane to capture a Bust, then finish the run.
    let bustCaptured = false;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const gameOver = await page.$('[data-testid="game-over-screen"]');
      if (gameOver) break;
      const state = await readLaneState(page);
      if (state.currentValue == null || state.laneCount === 0) {
        await sleep(250);
        continue;
      }

      let laneIndex = state.totals.findIndex((t) => t + state.currentValue > 21);
      if (laneIndex === -1) {
        // No overflow possible this turn — pick the highest total to set one up.
        laneIndex = state.totals.indexOf(Math.max(...state.totals));
      }
      const willBust = state.totals[laneIndex] + state.currentValue > 21;

      await tapTestId(page, `lane-${laneIndex + 1}`);
      await sleep(willBust ? 550 : 320);

      if (willBust && !bustCaptured) {
        await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '05-bust.png') });
        shots.push('05-bust.png');
        bustCaptured = true;
      }
    }

    // 07 — Game Over
    await waitForTestId(page, 'game-over-screen', 15000);
    await sleep(600);
    await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '07-game-over.png') });
    shots.push('07-game-over.png');

    // Back to Main Menu → Settings
    await sleep(400);
    await tapTestId(page, 'return-main-menu');
    await waitForTestId(page, 'main-menu', 10000);
    await sleep(400);
    await tapTestId(page, 'menu-settings');
    await waitForTestId(page, 'screen-settings', 10000);
    await sleep(500);
    await waitForFonts(page);
    await page.screenshot({ path: path.join(OUT_DIR, '08-settings.png') });
    shots.push('08-settings.png');
  } catch (error) {
    console.error('Screenshot capture stopped early:', error.message);
  } finally {
    await browser.close();
  }

  console.log('Captured:', shots.join(', ') || '(none)');
}

main();
