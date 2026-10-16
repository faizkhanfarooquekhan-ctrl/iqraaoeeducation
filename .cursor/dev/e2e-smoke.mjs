#!/usr/bin/env node
/**
 * Headless smoke test for the IQRA AOE learning system.
 * Covers master login, registration, class modules, speech cards, and math.
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.IQRA_BASE_URL || 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts';

async function visible(page, id) {
  return page.waitForFunction(
    (viewId) => {
      const el = document.getElementById(viewId);
      return el && !el.classList.contains('hidden');
    },
    { timeout: 15000 },
    id
  );
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await visible(page, 'view-login');
  await page.screenshot({ path: path.join(OUT, 'iqra-login.png'), fullPage: true });

  await page.type('#loginId', 'iqraaoe@123');
  await page.type('#loginPass', '9665700883');
  await page.click('#view-login button');
  await visible(page, 'view-onboarding');
  await page.screenshot({ path: path.join(OUT, 'iqra-onboarding.png'), fullPage: true });

  await page.type('#studentName', 'Ayesha Khan');
  await page.type('#studentMobile', '9876543210');
  await page.$eval('#studentDOB', (el) => {
    el.value = '2015-06-15';
  });
  await page.select('#studentClass', '3');
  await page.click('#view-onboarding button');
  await visible(page, 'view-dashboard');

  const dash = await page.evaluate(() => document.body.innerText);
  if (!dash.includes('Ayesha Khan') || !dash.includes('Class 3')) {
    throw new Error('Dashboard missing student name or class');
  }
  await page.screenshot({ path: path.join(OUT, 'iqra-dashboard.png'), fullPage: true });

  await page.evaluate(() => openCategory('English'));
  await visible(page, 'view-category');
  const modules = await page.evaluate(() => ({
    two: document.getElementById('btn-2L').classList.contains('hidden'),
    four: !document.getElementById('btn-4L').classList.contains('hidden'),
    five: !document.getElementById('btn-5L').classList.contains('hidden'),
    paras: document.getElementById('paraSelectorDiv').classList.contains('hidden'),
  }));
  if (!modules.two || !modules.four || !modules.five || !modules.paras) {
    throw new Error(`Class 3 modules incorrect: ${JSON.stringify(modules)}`);
  }

  await page.evaluate(() => loadContent('word', 4));
  await visible(page, 'view-content');
  const wordText = await page.evaluate(() => document.getElementById('contentGrid').innerText);
  if (!wordText.toLowerCase().includes('book')) {
    throw new Error('4-letter English words did not render');
  }
  await page.screenshot({ path: path.join(OUT, 'iqra-words.png'), fullPage: true });

  await page.evaluate(() => showView('view-dashboard'));
  await page.evaluate(() => openCategory('Urdu'));
  await page.evaluate(() => loadContent('word', 4));
  await visible(page, 'view-content');
  const urdu = await page.evaluate(() => {
    const card = document.querySelector('#contentGrid .urdu-font');
    return card ? card.textContent : '';
  });
  if (!urdu.includes('کتاب')) {
    throw new Error(`Urdu card missing expected word, got: ${urdu}`);
  }

  await page.evaluate(() => showView('view-math-hub'));
  await visible(page, 'view-math-hub');
  await page.evaluate(() => showView('view-tables'));
  await visible(page, 'view-tables');
  const table = await page.evaluate(() => document.getElementById('tableContent').innerText);
  if (!table.includes('4') || !table.includes('8')) {
    throw new Error('Multiplication table did not render');
  }
  await page.screenshot({ path: path.join(OUT, 'iqra-tables.png'), fullPage: true });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await visible(page, 'view-quick-login');
  const prefilled = await page.$eval('#quickMobile', (el) => el.value);
  if (prefilled !== '9876543210') {
    throw new Error('Quick login did not remember the mobile number');
  }
  await page.click('#view-quick-login .btn-primary');
  await visible(page, 'view-dashboard');

  await browser.close();
  console.log('E2E smoke passed. Screenshots in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
