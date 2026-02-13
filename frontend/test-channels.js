const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/openclaw/openclaw-manager/frontend/test-screenshots';

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
  console.log('Starting Channels Page Tests...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  const results = {
    round1: { listDisplay: [], issues: [] },
    round2: { crudOperations: [], issues: [] },
    round3: { errorHandling: [], issues: [] }
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

    // 2. Check page title and header
    console.log('2. Checking page header...');
    const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`   Page title: ${pageTitle}`);
    results.round1.listDisplay.push({ check: 'Page title', value: pageTitle });

    // 3. Check for table presence
    console.log('3. Checking table structure...');
    const tableExists = await page.$('table') !== null;
    console.log(`   Table exists: ${tableExists}`);
    results.round1.listDisplay.push({ check: 'Table exists', value: tableExists });

    // 4. Check for Add Channel button
    console.log('4. Checking Add Channel button...');
    const addButtonText = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建通道')) {
          return btn.textContent;
        }
      }
      return null;
    });
    console.log(`   Add button text: ${addButtonText}`);
    results.round1.listDisplay.push({ check: 'Add Channel button', value: addButtonText });

    // 5. Check table headers
    console.log('5. Checking table headers...');
    const headers = await page.$$eval('th', ths => ths.map(th => th.textContent.trim()));
    console.log(`   Headers: ${headers.join(', ')}`);
    results.round1.listDisplay.push({ check: 'Table headers', value: headers });

    // 6. Check for channels or empty state
    console.log('6. Checking channel data...');
    const rows = await page.$$eval('tbody tr', trs => trs.length);
    console.log(`   Number of rows: ${rows}`);

    if (rows === 1) {
      const firstRowText = await page.$eval('tbody tr td', td => td.textContent).catch(() => '');
      if (firstRowText.includes('No channels') || firstRowText.includes('no channel') || firstRowText.includes('没有')) {
        console.log('   Empty state detected');
        results.round1.listDisplay.push({ check: 'Empty state', value: true, message: firstRowText });
      }
    } else {
      results.round1.listDisplay.push({ check: 'Channel count', value: rows });

      // Check channel card information
      const channelData = await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        return Array.from(rows).slice(0, 3).map(row => {
          const cells = row.querySelectorAll('td');
          return {
            name: cells[0]?.textContent?.trim(),
            type: cells[1]?.textContent?.trim(),
            status: cells[2]?.textContent?.trim(),
            priority: cells[3]?.textContent?.trim(),
          };
        });
      });
      console.log('   Sample channel data:', JSON.stringify(channelData, null, 2));
      results.round1.listDisplay.push({ check: 'Channel data', value: channelData });
    }

    await takeScreenshot(page, 'round1-02-list-state');

    // =====================
    // ROUND 2: CRUD Operations
    // =====================
    console.log('\n=== ROUND 2: CRUD Operations ===\n');

    // 1. Test Add Channel button
    console.log('1. Testing Add Channel button...');
    const addButtonClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    console.log(`   Add button clicked: ${addButtonClicked}`);
    await sleep(1000);
    await takeScreenshot(page, 'round2-01-add-dialog');

    // Check if dialog opened
    const dialogVisible = await page.$('[role="dialog"]') !== null;
    console.log(`   Dialog visible: ${dialogVisible}`);
    results.round2.crudOperations.push({ check: 'Add dialog opens', value: dialogVisible });

    // Check form fields
    const formFields = await page.$$eval('[role="dialog"] input, [role="dialog"] select', inputs =>
      inputs.map(input => ({ id: input.id, type: input.type, placeholder: input.placeholder }))
    );
    console.log('   Form fields:', JSON.stringify(formFields, null, 2));
    results.round2.crudOperations.push({ check: 'Form fields', value: formFields });

    // 2. Fill form for creating a new channel
    console.log('2. Filling channel form...');

    // Fill name
    await page.type('[role="dialog"] input#name', 'Test Channel', { delay: 50 });
    console.log('   Name filled');

    // Select type (OpenAI is default)
    const selectedType = await page.$eval('[role="dialog"] button[data-state]', el => el.textContent).catch(() => 'OpenAI');
    console.log(`   Selected type: ${selectedType}`);

    // Fill API key
    await page.type('[role="dialog"] input#apiKey', 'sk-test123456789012345678901234567890', { delay: 50 });
    console.log('   API key filled');

    // Set priority
    await page.evaluate(() => {
      const priorityInput = document.querySelector('[role="dialog"] input#priority');
      if (priorityInput) {
        priorityInput.value = '5';
        priorityInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    console.log('   Priority set');

    await sleep(500);
    await takeScreenshot(page, 'round2-02-filled-form');

    // 3. Submit form (click Add button in dialog)
    console.log('3. Submitting form...');
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const buttons = dialog.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
            btn.click();
            return;
          }
        }
      }
    });
    console.log('   Submit button clicked');
    await sleep(2000);
    await takeScreenshot(page, 'round2-03-after-submit');

    // Check if dialog closed
    const dialogClosed = await page.$('[role="dialog"]') === null;
    console.log(`   Dialog closed: ${dialogClosed}`);
    results.round2.crudOperations.push({ check: 'Dialog closes after submit', value: dialogClosed });

    // 4. Check if channel was added
    console.log('4. Checking if channel was added...');
    await sleep(1000);
    const newRowCount = await page.$$eval('tbody tr', trs => trs.length);
    console.log(`   New row count: ${newRowCount}`);
    results.round2.crudOperations.push({ check: 'Channel added', value: newRowCount > rows });

    await takeScreenshot(page, 'round2-04-after-add');

    // 5. Test Edit functionality
    console.log('5. Testing Edit functionality...');
    const menuButtonClicked = await page.evaluate(() => {
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
    console.log(`   Menu button clicked: ${menuButtonClicked}`);
    await sleep(500);
    await takeScreenshot(page, 'round2-05-dropdown-menu');

    // Click Edit
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
    console.log(`   Edit clicked: ${editClicked}`);
    await sleep(1000);
    await takeScreenshot(page, 'round2-06-edit-dialog');

    const editDialogVisible = await page.$('[role="dialog"]') !== null;
    console.log(`   Edit dialog visible: ${editDialogVisible}`);
    results.round2.crudOperations.push({ check: 'Edit dialog opens', value: editDialogVisible });

    // Close dialog
    if (editDialogVisible) {
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    // 6. Test Enable/Disable toggle
    console.log('6. Testing Enable/Disable toggle...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const switchExists = await page.$('button[role="switch"]') !== null;
    console.log(`   Switch exists: ${switchExists}`);

    if (switchExists) {
      const initialChecked = await page.$eval('button[role="switch"]', el => el.getAttribute('aria-checked'));
      console.log(`   Initial checked state: ${initialChecked}`);

      await page.click('button[role="switch"]');
      await sleep(500);
      await takeScreenshot(page, 'round2-07-after-toggle');

      const newChecked = await page.$eval('button[role="switch"]', el => el.getAttribute('aria-checked')).catch(() => null);
      console.log(`   New checked state: ${newChecked}`);
      results.round2.crudOperations.push({
        check: 'Toggle switch',
        value: initialChecked !== newChecked,
        before: initialChecked,
        after: newChecked
      });
    }

    // 7. Test Connection test button
    console.log('7. Testing Connection Test button...');
    const menuButton2Clicked = await page.evaluate(() => {
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

    const testConnectionClicked = await page.evaluate(() => {
      const menuItems = document.querySelectorAll('[role="menuitem"]');
      for (const item of menuItems) {
        if (item.textContent.includes('Test') || item.textContent.includes('Connection') || item.textContent.includes('测试') || item.textContent.includes('连接')) {
          item.click();
          return true;
        }
      }
      return false;
    });
    console.log(`   Test connection clicked: ${testConnectionClicked}`);
    await sleep(1000);
    await takeScreenshot(page, 'round2-08-test-connection-dialog');

    const testDialogVisible = await page.$('[role="dialog"]') !== null;
    console.log(`   Test dialog visible: ${testDialogVisible}`);
    results.round2.crudOperations.push({ check: 'Test connection dialog opens', value: testDialogVisible });

    // Close dialog
    if (testDialogVisible) {
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    // 8. Test Delete functionality
    console.log('8. Testing Delete functionality...');
    const menuButton3Clicked = await page.evaluate(() => {
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

    const deleteClicked = await page.evaluate(() => {
      const menuItems = document.querySelectorAll('[role="menuitem"]');
      for (const item of menuItems) {
        if (item.textContent.includes('Delete') || item.textContent.includes('删除')) {
          item.click();
          return true;
        }
      }
      return false;
    });
    console.log(`   Delete clicked: ${deleteClicked}`);
    await sleep(500);
    await takeScreenshot(page, 'round2-09-delete-confirm');

    // Check for confirm dialog
    const confirmDialog = await page.evaluate(() => {
      return document.querySelector('[role="alertdialog"]') ? 'custom' : 'native';
    });
    console.log(`   Confirm dialog type: ${confirmDialog}`);

    await takeScreenshot(page, 'round2-10-after-delete');

    // =====================
    // ROUND 3: Error Handling
    // =====================
    console.log('\n=== ROUND 3: Error Handling ===\n');

    // 1. Test form validation
    console.log('1. Testing form validation...');

    // Open Add dialog
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

    // Try to submit empty form
    console.log('   Testing empty form submission...');
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const buttons = dialog.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent.includes('Add') || btn.textContent.includes('Create') || btn.textContent.includes('创建')) {
            btn.click();
            return;
          }
        }
      }
    });
    await sleep(500);
    await takeScreenshot(page, 'round3-02-validation-errors');

    // Check for validation errors
    const errors = await page.$$eval('.text-destructive, [class*="error"], [class*="invalid"]', els =>
      els.map(el => el.textContent.trim()).filter(t => t)
    );
    console.log(`   Validation errors found: ${errors.length}`);
    console.log(`   Errors: ${errors.join(', ')}`);
    results.round3.errorHandling.push({ check: 'Validation errors', value: errors.length > 0, errors });

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
          return hint.textContent;
        }
      }
      return null;
    });
    console.log(`   API key warning: ${apiKeyWarning}`);
    results.round3.errorHandling.push({ check: 'API key format warning', value: !!apiKeyWarning, message: apiKeyWarning });

    // 3. Test invalid URL
    console.log('3. Testing invalid URL...');
    await page.type('[role="dialog"] input#baseURL', 'not-a-url', { delay: 50 });
    await page.$eval('[role="dialog"] input#baseURL', el => el.blur());
    await sleep(500);
    await takeScreenshot(page, 'round3-04-invalid-url');

    const urlError = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.text-destructive');
      for (const el of errorElements) {
        if (el.textContent.includes('URL') || el.textContent.includes('url') || el.textContent.includes('Invalid')) {
          return el.textContent;
        }
      }
      return null;
    });
    console.log(`   URL error: ${urlError}`);
    results.round3.errorHandling.push({ check: 'URL validation', value: !!urlError, message: urlError });

    // 4. Test loading states
    console.log('4. Testing loading states...');
    await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });

    // Check for loading indicators
    const loadingIndicators = await page.$$eval('[class*="animate-spin"], [class*="loading"]', els => els.length);
    console.log(`   Loading indicators on page: ${loadingIndicators}`);
    results.round3.errorHandling.push({ check: 'Loading indicators', value: loadingIndicators });

    await takeScreenshot(page, 'round3-05-loading-state');

    // 5. Test network error handling (simulate offline)
    console.log('5. Testing network error handling...');
    await page.context().setOffline(true);
    await page.reload({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(2000);
    await takeScreenshot(page, 'round3-06-offline-state');

    const errorMessage = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="toast"], [role="alert"]');
      return Array.from(errorElements).map(el => el.textContent.trim()).filter(t => t);
    });
    console.log(`   Error messages: ${errorMessage.join(', ')}`);
    results.round3.errorHandling.push({ check: 'Network error message', value: errorMessage.length > 0, messages: errorMessage });

    // Restore network
    await page.context().setOffline(false);

    console.log('\n=== TEST SUMMARY ===\n');
    console.log('Round 1 (List Display):');
    console.log(JSON.stringify(results.round1, null, 2));
    console.log('\nRound 2 (CRUD Operations):');
    console.log(JSON.stringify(results.round2, null, 2));
    console.log('\nRound 3 (Error Handling):');
    console.log(JSON.stringify(results.round3, null, 2));

    // Write results to file
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'test-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log(`\nResults saved to ${SCREENSHOTS_DIR}/test-results.json`);

  } catch (error) {
    console.error('Test error:', error);
    await takeScreenshot(page, 'error-state').catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

runTests().catch(console.error);
