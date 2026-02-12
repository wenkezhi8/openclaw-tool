const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen for console messages and errors
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      console.log(`[Browser Console Error] ${text}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[Page Error] ${error.message}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP Error] ${response.url()} - ${response.status()}`);
    }
  });

  // Navigate to the page
  console.log('Navigating to http://localhost:3000...');
  const startTime = Date.now();

  try {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
  } catch (error) {
    console.error(`Failed to load page: ${error.message}`);
    await browser.close();
    process.exit(1);
  }

  const loadTime = Date.now() - startTime;
  console.log(`Page loaded in ${loadTime}ms`);

  // Wait for dynamic content
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Take a screenshot
  const screenshotPath = path.join(__dirname, 'screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Get page title
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Get page content summary
  const content = await page.evaluate(() => {
    return {
      hasHeader: !!document.querySelector('header'),
      hasMain: !!document.querySelector('main'),
      hasNav: !!document.querySelector('nav'),
      bodyClasses: document.body.className,
      lang: document.documentElement.lang,
      url: window.location.href
    };
  });

  console.log('\nPage structure:', JSON.stringify(content, null, 2));

  // Check for specific elements
  const elements = await page.evaluate(() => {
    const results = {};

    // Check for navigation
    const navLinks = document.querySelectorAll('nav a');
    results.navLinks = Array.from(navLinks).map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') }));

    // Check for any error messages visible
    const errorText = document.body.innerText;
    results.hasErrorText = errorText.includes('Error') || errorText.includes('error');

    // Get main heading
    const h1 = document.querySelector('h1');
    results.mainHeading = h1?.textContent?.trim();

    return results;
  });

  console.log('\nElements found:', JSON.stringify(elements, null, 2));

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Load time: ${loadTime}ms`);
  console.log(`Console errors: ${consoleLogs.filter(l => l.type === 'error').length}`);
  console.log(`Page errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nPage errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  await browser.close();
  return { loadTime, consoleLogs, errors, content, elements };
}

testPage()
  .then(result => {
    console.log('\nTest completed successfully!');
    console.log('Screenshot: frontend/screenshot.png');
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
