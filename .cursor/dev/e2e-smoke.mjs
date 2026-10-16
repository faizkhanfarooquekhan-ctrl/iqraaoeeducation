#!/usr/bin/env node
/**
 * Headless smoke test: master login, registration, dashboard, quick login.
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.IQRA_BASE_URL || 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts';

function waitVisible(page, id) {
  return page.waitForFunction((viewId) => {
    const el = document.getElementById(viewId);
    return !!el && !el.classList.contains('hidden');
  }, { timeout: 15000 }, id);
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
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
  });

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitVisible(page, 'view-login');
  await page.screenshot({ path: path.join(OUT, 'iqra-master-login.png'), fullPage: true });

  await page.type('#loginId', 'wrong');
  await page.type('#loginPass', 'wrong');
  await page.click('button[onclick="attemptLogin()"]');
  await page.waitForFunction(() => document.body.innerText.includes('Invalid Master ID'), { timeout: 5000 });

  await page.click('#loginId', { clickCount: 3 });
  await page.type('#loginId', 'iqraaoe@123');
  await page.click('#loginPass', { clickCount: 3 });
  await page.type('#loginPass', '9665700883');
  await page.click('button[onclick="attemptLogin()"]');
  await waitVisible(page, 'view-onboarding');

  await page.type('#studentName', 'Ayesha Khan');
  await page.type('#studentMobile', '9876543210');
  await page.$eval('#studentDOB', (el) => { el.value = '2015-04-12'; });
  await page.select('#studentClass', '1');
  await page.screenshot({ path: path.join(OUT, 'iqra-onboarding.png'), fullPage: true });
  await page.click('button[onclick="startApp()"]');
  await waitVisible(page, 'view-dashboard');

  const dash = await page.evaluate(() => document.body.innerText);
  if (!dash.includes('Ayesha Khan') || !dash.includes('Faiz Khan')) {
    throw new Error('Dashboard missing student name or team footer');
  }
  await page.screenshot({ path: path.join(OUT, 'iqra-dashboard.png'), fullPage: true });

  await page.evaluate(() => openCategory('English'));
  await waitVisible(page, 'view-category');
  const class1 = await page.evaluate(() => ({
    two: !document.getElementById('btn-2L').classList.contains('hidden'),
    three: !document.getElementById('btn-3L').classList.contains('hidden'),
    four: document.getElementById('btn-4L').classList.contains('hidden'),
    para: document.getElementById('paraSelectorDiv').classList.contains('hidden'),
  }));
  if (!class1.two || !class1.three || !class1.four || !class1.para) {
    throw new Error('Class 1 word modules are wrong: ' + JSON.stringify(class1));
  }

  await page.evaluate(() => loadContent('word', 2));
  await page.waitForFunction(() => document.body.innerText.includes('am'), { timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, 'iqra-words.png'), fullPage: true });

  await page.evaluate(() => showView('view-dashboard'));
  await page.evaluate(() => {
    currentUser.classLvl = 7;
    openCategory('Urdu');
  });
  await page.waitForFunction(() => !document.getElementById('paraSelectorDiv').classList.contains('hidden'), { timeout: 10000 });
  await page.evaluate(() => loadContent('para', 0));
  await page.waitForFunction(() => document.body.innerText.includes('وقت کی اہمیت'), { timeout: 10000 });
  const urduDir = await page.evaluate(() => document.querySelector('#contentGrid [dir="rtl"]') !== null);
  if (!urduDir) throw new Error('Urdu paragraph is not RTL');

  await page.evaluate(() => showView('view-dashboard'));
  await page.evaluate(() => showView('view-math-hub'));
  await page.evaluate(() => startMathSession());
  await page.waitForFunction(() => document.getElementById('mathOptions').children.length === 4, { timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, 'iqra-math.png'), fullPage: true });

  await page.evaluate(() => logout());
  await waitVisible(page, 'view-quick-login');
  const quick = await page.$eval('#quickMobile', (el) => el.value);
  if (quick !== '9876543210') throw new Error('Quick login did not remember mobile');
  await page.click('button[onclick="attemptQuickLogin()"]');
  await waitVisible(page, 'view-dashboard');

  await browser.close();
  console.log('E2E smoke passed. Screenshots in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
