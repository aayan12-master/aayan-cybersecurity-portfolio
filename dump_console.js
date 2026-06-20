import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleLogs = [];

  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    console.log(text);
    consoleLogs.push(text);
  });

  page.on('pageerror', err => {
    const text = `[EXCEPTION] ${err.message}`;
    console.error(text);
    consoleLogs.push(text);
  });

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5174/admin/login');
    await page.waitForTimeout(1000);

    console.log('Logging in...');
    await page.fill('input[type="text"]', process.env.TEST_ADMIN_EMAIL || 'aayansayyad168@gmail.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log('Navigating to messages page...');
    await page.goto('http://localhost:5174/admin/messages');
    await page.waitForTimeout(3000);

    console.log('Writing logs to file...');
    fs.writeFileSync('console_logs.txt', consoleLogs.join('\n'));
    console.log('Done!');
  } catch (err) {
    console.error('Playwright Script Error:', err);
  } finally {
    await browser.close();
  }
})();
