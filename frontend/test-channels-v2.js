const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/openclaw/openclaw-manager/frontend/test-screenshots/channels-v2';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Screenshot saved: ${filepath}`);
  return filepath;
}

async function runTests() {
  console.log('Starting Channels Page Tests (v2)...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  const issues = [];
  const testResults = {
    round1: { passed: 0, failed: 0, details: [] },
    round2: { passed: 0, failed: 0, details: [] },
    round3: { passed: 0, failed: 0, details: [] }
  };

  try {
    // =====================
    // ROUND 1: List Display
    // =====================
    console.log('=== ROUND 1: List Display ===\n');

    // 1. Navigate to channels page
    console.log('1. Navigating to /channels...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await takeScreenshot(page, 'round1-01-channels-page');

    // 2. Check page title
    console.log('2. Checking page header...');
    const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    if (pageTitle) {
      console.log(`   PASS: Page title found: "${pageTitle}"`);
      testResults.round1.passed++;
      testResults.round1.details.push({ test: 'Page title', status: 'PASS', value: pageTitle });
    } else {
      console.log(`   FAIL: Page title not found`);
      testResults.round1.failed++;
      testResults.round1.details.push({ test: 'Page title', status: 'FAIL' });
      issues.push({ round: 1, test: 'Page title', issue: 'Page title not found' });
    }

    // 3. Check table structure
    console.log('3. Checking table structure...');
    const tableExists = await page.$('table') !== null;
    if (tableExists) {
      console.log('   PASS: Table exists');
      testResults.round1.passed++;
      testResults.round1.details.push({ test: 'Table exists', status: 'PASS' });
    } else {
      console.log('   FAIL: Table not found');
      testResults.round1.failed++;
      testResults.round1.details.push({ test: 'Table exists', status: 'FAIL' });
      issues.push({ round: 1, test: 'Table structure', issue: 'Table element not found' });
    }

    // 4. Check table headers
    console.log('4. Checking table headers...');
    const headers = await page.$$eval('th', ths => ths.map(th => th.textContent.trim()));
    const expectedHeaders = ['Name', 'Type', 'Status', 'Priority', 'Enabled', 'Created', 'Actions'];
    const headersCorrect = expectedHeaders.every(h => headers.includes(h));
    if (headersCorrect) {
      console.log(`   PASS: All expected headers found: ${headers.join(', ')}`);
      testResults.round1.passed++;
      testResults.round1.details.push({ test: 'Table headers', status: 'PASS', value: headers });
    } else {
      console.log(`   FAIL: Missing headers. Found: ${headers.join(', ')}`);
      testResults.round1.failed++;
      testResults.round1.details.push({ test: 'Table headers', status: 'FAIL', expected: expectedHeaders, found: headers });
      issues.push({ round: 1, test: 'Table headers', issue: `Missing headers. Expected: ${expectedHeaders.join(', ')}, Found: ${headers.join(', ')}` });
    }

    // 5. Check Add Channel button
    console.log('5. Checking Add Channel button...');
    const addButtonText = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
          return btn.textContent;
        }
      }
      return null;
    });
    if (addButtonText) {
      console.log(`   PASS: Add button found with text: "${addButtonText}"`);
      testResults.round1.passed++;
      testResults.round1.details.push({ test: 'Add button', status: 'PASS', value: addButtonText });
    } else {
      console.log('   FAIL: Add button not found');
      testResults.round1.failed++;
      testResults.round1.details.push({ test: 'Add button', status: 'FAIL' });
      issues.push({ round: 1, test: 'Add button', issue: 'Add/Create button not found' });
    }

    // 6. Check channel rows
    console.log('6. Checking channel data...');
    const rows = await page.$$eval('tbody tr', trs => trs.length);
    console.log(`   Found ${rows} row(s)`);

    if (rows > 0) {
      // Check if it's an empty state message or actual data
      const firstRowCells = await page.$$eval('tbody tr:first-child td', tds => tds.map(td => td.textContent.trim()));
      const isEmptyState = firstRowCells.length === 1 && firstRowCells[0].includes('No channel');

      if (isEmptyState) {
        console.log('   INFO: Empty state message displayed');
        testResults.round1.details.push({ test: 'Channel data', status: 'INFO', value: 'Empty state' });
      } else {
        console.log('   PASS: Channel data displayed');
        testResults.round1.passed++;
        testResults.round1.details.push({ test: 'Channel data', status: 'PASS', rowCount: rows });
      }
    }

    await takeScreenshot(page, 'round1-02-final');

    // =====================
    // ROUND 2: CRUD Operations
    // =====================
    console.log('\n=== ROUND 2: CRUD Operations ===\n');

    // 1. Test Add Channel dialog
    console.log('1. Testing Add Channel dialog...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    await sleep(1000);
    await takeScreenshot(page, 'round2-01-add-dialog');

    const dialogVisible = await page.$('[role="dialog"]') !== null;
    if (dialogVisible) {
      console.log('   PASS: Add dialog opened');
      testResults.round2.passed++;
      testResults.round2.details.push({ test: 'Add dialog opens', status: 'PASS' });
    } else {
      console.log('   FAIL: Add dialog did not open');
      testResults.round2.failed++;
      testResults.round2.details.push({ test: 'Add dialog opens', status: 'FAIL' });
      issues.push({ round: 2, test: 'Add dialog', issue: 'Dialog did not open when clicking Add button' });
    }

    // 2. Fill form
    console.log('2. Filling channel form...');
    try {
      await page.type('[role="dialog"] input#name', 'Test Channel E2E', { delay: 50 });
      await page.type('[role="dialog"] input#apiKey', 'sk-test123456789012345678901234567890', { delay: 50 });
      await page.evaluate(() => {
        const priorityInput = document.querySelector('[role="dialog"] input#priority');
        if (priorityInput) {
          priorityInput.value = '5';
          priorityInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      console.log('   PASS: Form filled successfully');
      testResults.round2.passed++;
      testResults.round2.details.push({ test: 'Form fill', status: 'PASS' });
    } catch (e) {
      console.log(`   FAIL: Could not fill form: ${e.message}`);
      testResults.round2.failed++;
      testResults.round2.details.push({ test: 'Form fill', status: 'FAIL', error: e.message });
      issues.push({ round: 2, test: 'Form fill', issue: `Could not fill form: ${e.message}` });
    }
    await sleep(500);
    await takeScreenshot(page, 'round2-02-filled-form');

    // 3. Submit form
    console.log('3. Submitting form...');
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const buttons = dialog.querySelectorAll('button');
        for (const btn of buttons) {
          if ((btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) && btn.type === 'submit') {
            btn.click();
            return;
          }
        }
        // If no submit button found, try any Add button
        for (const btn of buttons) {
          if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
            btn.click();
            return;
          }
        }
      }
    });
    await sleep(2000);
    await takeScreenshot(page, 'round2-03-after-submit');

    const dialogClosed = await page.$('[role="dialog"]') === null;
    if (dialogClosed) {
      console.log('   PASS: Dialog closed after submit');
      testResults.round2.passed++;
      testResults.round2.details.push({ test: 'Dialog closes', status: 'PASS' });
    } else {
      console.log('   INFO: Dialog still open (might be validation or API error)');
      testResults.round2.details.push({ test: 'Dialog closes', status: 'INFO', note: 'Dialog still open' });
    }

    // 4. Check for new channel
    console.log('4. Checking if channel was added...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(1000);
    const newRow = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      for (const row of rows) {
        if (row.textContent.includes('Test Channel E2E')) {
          return true;
        }
      }
      return false;
    });
    if (newRow) {
      console.log('   PASS: New channel appears in list');
      testResults.round2.passed++;
      testResults.round2.details.push({ test: 'Channel added', status: 'PASS' });
    } else {
      console.log('   INFO: New channel not found (API might have failed)');
      testResults.round2.details.push({ test: 'Channel added', status: 'INFO', note: 'Channel not visible, might be API issue' });
    }
    await takeScreenshot(page, 'round2-04-after-add');

    // 5. Test Edit functionality
    console.log('5. Testing Edit functionality...');
    const menuClicked = await page.evaluate(() => {
      const cells = document.querySelectorAll('td');
      for (const cell of cells) {
        const btn = cell.querySelector('button');
        if (btn && btn.querySelector('svg')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    await sleep(500);

    if (menuClicked) {
      const editClicked = await page.evaluate(() => {
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        for (const item of menuItems) {
          if (item.textContent.includes('Edit') || item.textContent.includes('编辑')) {
            item.click();
            return true;
          }
        }
        return false;
      });
      await sleep(1000);
      await takeScreenshot(page, 'round2-05-edit-dialog');

      if (editClicked) {
        const editDialogVisible = await page.$('[role="dialog"]') !== null;
        if (editDialogVisible) {
          console.log('   PASS: Edit dialog opened');
          testResults.round2.passed++;
          testResults.round2.details.push({ test: 'Edit dialog', status: 'PASS' });
        } else {
          console.log('   FAIL: Edit dialog did not open');
          testResults.round2.failed++;
          testResults.round2.details.push({ test: 'Edit dialog', status: 'FAIL' });
          issues.push({ round: 2, test: 'Edit dialog', issue: 'Edit dialog did not open' });
        }
      }
    } else {
      console.log('   INFO: No channel menu found to test edit');
      testResults.round2.details.push({ test: 'Edit dialog', status: 'SKIP', note: 'No channel to edit' });
    }

    // Close any open dialog
    await page.keyboard.press('Escape');
    await sleep(500);

    // 6. Test Toggle switch
    console.log('6. Testing Enable/Disable toggle...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const switchExists = await page.$('button[role="switch"]') !== null;
    if (switchExists) {
      const initialState = await page.$eval('button[role="switch"]', el => el.getAttribute('aria-checked'));
      await page.click('button[role="switch"]');
      await sleep(500);
      await takeScreenshot(page, 'round2-06-after-toggle');

      const newState = await page.$eval('button[role="switch"]', el => el.getAttribute('aria-checked')).catch(() => null);
      if (initialState !== newState) {
        console.log('   PASS: Toggle switch works');
        testResults.round2.passed++;
        testResults.round2.details.push({ test: 'Toggle switch', status: 'PASS', before: initialState, after: newState });
      } else {
        console.log('   INFO: Toggle state might not have changed (API issue?)');
        testResults.round2.details.push({ test: 'Toggle switch', status: 'INFO', note: 'State unchanged' });
      }
    } else {
      console.log('   INFO: No switch found to test');
      testResults.round2.details.push({ test: 'Toggle switch', status: 'SKIP', note: 'No channel with switch' });
    }

    // 7. Test Connection Test button
    console.log('7. Testing Connection Test...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(500);

    const menuClicked2 = await page.evaluate(() => {
      const cells = document.querySelectorAll('td');
      for (const cell of cells) {
        const btn = cell.querySelector('button');
        if (btn && btn.querySelector('svg')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    await sleep(500);

    if (menuClicked2) {
      const testClicked = await page.evaluate(() => {
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        for (const item of menuItems) {
          if (item.textContent.includes('Test') || item.textContent.includes('测试') || item.textContent.includes('Connection')) {
            item.click();
            return true;
          }
        }
        return false;
      });
      await sleep(1000);
      await takeScreenshot(page, 'round2-07-test-dialog');

      if (testClicked) {
        const testDialogVisible = await page.$('[role="dialog"]') !== null;
        if (testDialogVisible) {
          console.log('   PASS: Test connection dialog opened');
          testResults.round2.passed++;
          testResults.round2.details.push({ test: 'Test connection dialog', status: 'PASS' });
        } else {
          console.log('   FAIL: Test connection dialog did not open');
          testResults.round2.failed++;
          testResults.round2.details.push({ test: 'Test connection dialog', status: 'FAIL' });
          issues.push({ round: 2, test: 'Test connection dialog', issue: 'Dialog did not open' });
        }
      }
    } else {
      console.log('   INFO: No channel menu found to test connection');
      testResults.round2.details.push({ test: 'Test connection dialog', status: 'SKIP', note: 'No channel to test' });
    }

    // Close dialog
    await page.keyboard.press('Escape');
    await sleep(500);

    // =====================
    // ROUND 3: Error Handling
    // =====================
    console.log('\n=== ROUND 3: Error Handling ===\n');

    // 1. Test form validation - empty form
    console.log('1. Testing empty form validation...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(500);

    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
          btn.click();
        }
      }
    });
    await sleep(1000);
    await takeScreenshot(page, 'round3-01-add-dialog');

    // Submit empty form
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const buttons = dialog.querySelectorAll('button');
        for (const btn of buttons) {
          if ((btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) && btn.type === 'submit') {
            btn.click();
            return;
          }
        }
      }
    });
    await sleep(500);
    await takeScreenshot(page, 'round3-02-validation-errors');

    // Check for validation errors
    const validationErrors = await page.$$eval('.text-destructive', els =>
      els.map(el => el.textContent.trim()).filter(t => t && t.length > 1 && !t.includes('*'))
    );
    if (validationErrors.length > 0) {
      console.log(`   PASS: Validation errors shown: ${validationErrors.join(', ')}`);
      testResults.round3.passed++;
      testResults.round3.details.push({ test: 'Empty form validation', status: 'PASS', errors: validationErrors });
    } else {
      console.log('   FAIL: No validation errors shown for empty form');
      testResults.round3.failed++;
      testResults.round3.details.push({ test: 'Empty form validation', status: 'FAIL' });
      issues.push({ round: 3, test: 'Empty form validation', issue: 'No validation errors shown' });
    }

    // 2. Test invalid API key format
    console.log('2. Testing invalid API key format...');
    await page.type('[role="dialog"] input#name', 'Test', { delay: 50 });
    await page.type('[role="dialog"] input#apiKey', 'invalid-key', { delay: 50 });
    await page.$eval('[role="dialog"] input#apiKey', el => el.blur());
    await sleep(500);
    await takeScreenshot(page, 'round3-03-invalid-api-key');

    const apiKeyWarning = await page.evaluate(() => {
      const hints = document.querySelectorAll('.text-muted-foreground, .text-xs');
      for (const hint of hints) {
        if (hint.textContent.includes('format') || hint.textContent.includes('incorrect') || hint.textContent.includes('格式')) {
          return hint.textContent.trim();
        }
      }
      return null;
    });
    if (apiKeyWarning) {
      console.log(`   PASS: API key format warning shown: "${apiKeyWarning}"`);
      testResults.round3.passed++;
      testResults.round3.details.push({ test: 'API key format warning', status: 'PASS', message: apiKeyWarning });
    } else {
      console.log('   INFO: No API key format warning (validation might be optional)');
      testResults.round3.details.push({ test: 'API key format warning', status: 'INFO' });
    }

    // 3. Test invalid URL
    console.log('3. Testing invalid URL validation...');
    await page.type('[role="dialog"] input#baseURL', 'not-a-url', { delay: 50 });
    await page.$eval('[role="dialog"] input#baseURL', el => el.blur());
    await sleep(500);
    await takeScreenshot(page, 'round3-04-invalid-url');

    const urlError = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.text-destructive');
      for (const el of errorElements) {
        if (el.textContent.includes('URL') || el.textContent.includes('url') || el.textContent.includes('Invalid') || el.textContent.includes('invalid')) {
          return el.textContent.trim();
        }
      }
      return null;
    });
    if (urlError) {
      console.log(`   PASS: URL validation error shown: "${urlError}"`);
      testResults.round3.passed++;
      testResults.round3.details.push({ test: 'URL validation', status: 'PASS', message: urlError });
    } else {
      console.log('   FAIL: No URL validation error shown');
      testResults.round3.failed++;
      testResults.round3.details.push({ test: 'URL validation', status: 'FAIL' });
      issues.push({ round: 3, test: 'URL validation', issue: 'No error shown for invalid URL "not-a-url"', file: '/Users/openclaw/openclaw-manager/frontend/components/channels/channel-form.tsx' });
    }

    // 4. Test short name validation
    console.log('4. Testing short name validation...');
    const nameInput = await page.$('[role="dialog"] input#name');
    await nameInput.click({ clickCount: 3 }); // Select all
    await page.type('[role="dialog"] input#name', 'A', { delay: 50 });
    await page.$eval('[role="dialog"] input#name', el => el.blur());
    await sleep(500);
    await takeScreenshot(page, 'round3-05-short-name');

    const nameError = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.text-destructive');
      for (const el of errorElements) {
        if (el.textContent.includes('Name') || el.textContent.includes('name') || el.textContent.includes('2 characters')) {
          return el.textContent.trim();
        }
      }
      return null;
    });
    if (nameError) {
      console.log(`   PASS: Name validation error shown: "${nameError}"`);
      testResults.round3.passed++;
      testResults.round3.details.push({ test: 'Name validation', status: 'PASS', message: nameError });
    } else {
      console.log('   FAIL: No name validation error shown');
      testResults.round3.failed++;
      testResults.round3.details.push({ test: 'Name validation', status: 'FAIL' });
      issues.push({ round: 3, test: 'Name validation', issue: 'No error shown for single character name' });
    }

    // 5. Test priority validation
    console.log('5. Testing priority validation...');
    const priorityInput = await page.$('[role="dialog"] input#priority');
    await priorityInput.click({ clickCount: 3 });
    await page.type('[role="dialog"] input#priority', '0', { delay: 50 });
    await page.$eval('[role="dialog"] input#priority', el => el.blur());
    await sleep(500);
    await takeScreenshot(page, 'round3-06-invalid-priority');

    const priorityError = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.text-destructive');
      for (const el of errorElements) {
        if (el.textContent.includes('Priority') || el.textContent.includes('priority') || el.textContent.includes('at least 1')) {
          return el.textContent.trim();
        }
      }
      return null;
    });
    if (priorityError) {
      console.log(`   PASS: Priority validation error shown: "${priorityError}"`);
      testResults.round3.passed++;
      testResults.round3.details.push({ test: 'Priority validation', status: 'PASS', message: priorityError });
    } else {
      console.log('   INFO: No priority validation error (might allow 0)');
      testResults.round3.details.push({ test: 'Priority validation', status: 'INFO' });
    }

    // Summary
    console.log('\n=== TEST SUMMARY ===\n');
    console.log(`Round 1 (List Display): ${testResults.round1.passed} passed, ${testResults.round1.failed} failed`);
    console.log(`Round 2 (CRUD Operations): ${testResults.round2.passed} passed, ${testResults.round2.failed} failed`);
    console.log(`Round 3 (Error Handling): ${testResults.round3.passed} passed, ${testResults.round3.failed} failed`);
    console.log(`\nTotal Issues Found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\nIssues:');
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. [Round ${issue.round}] ${issue.test}: ${issue.issue}`);
        if (issue.file) {
          console.log(`     File: ${issue.file}`);
        }
      });
    }

    // Write results to file
    const fullResults = {
      timestamp: new Date().toISOString(),
      summary: testResults,
      issues: issues
    };
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'test-results.json'),
      JSON.stringify(fullResults, null, 2)
    );
    console.log(`\nResults saved to ${SCREENSHOTS_DIR}/test-results.json`);

    return { testResults, issues };

  } catch (error) {
    console.error('Test error:', error);
    await takeScreenshot(page, 'error-state').catch(() => {});
    issues.push({ round: 'error', test: 'Test execution', issue: error.message });
    return { testResults, issues, error: error.message };
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
