#!/usr/bin/env node
/**
 * Headless smoke test for local dev server (login + dashboard).
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.IQRA_BASE_URL || 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts';

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({ path: path.join(OUT, 'iqra-login.png'), fullPage: true });

  await page.type('#login-id', 'STD001');
  await page.type('#login-pass', 'pass123');
  await page.click('#login-form button[type="submit"]');
  await page.waitForFunction(
    () => !document.getElementById('view-dashboard').classList.contains('hidden'),
    { timeout: 15000 }
  );
  await page.screenshot({ path: path.join(OUT, 'iqra-dashboard.png'), fullPage: true });

  const langBtn = await page.$('[data-go="view-language"]');
  if (langBtn) {
    await langBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT, 'iqra-language-hub.png'), fullPage: true });
  }

  const text = await page.evaluate(() => document.body.innerText);
  if (!text.includes('Ayesha Khan')) {
    throw new Error('Dashboard missing student name');
  }

  await browser.close();
  console.log('E2E smoke passed. Screenshots in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
