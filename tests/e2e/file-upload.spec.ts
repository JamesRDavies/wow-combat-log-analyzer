
import { test, expect } from '@playwright/test';

test('File upload accepts valid .txt file', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(1024 * 1024)
  });

  await expect(page.locator('#file-details'))
    .toHaveText('valid-log.txt (1.00 MB)');

  await expect(page.locator('#file-error')).toBeHidden();
});


test('shows validation error for invalid file types', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'invalid-log.png',
    mimeType: 'image/png',
    buffer: Buffer.from('this is a png file')
  });

  await expect(page.locator('#file-error'))
    .toHaveText('Invalid file type. Please upload a .txt file.');

  await expect(page.locator('#file-details')).toBeEmpty();
});


test('File details update correctly when selection changes', async ({ page }) => {
  await page.goto('/');

  // Select initial valid .txt file (1 MB)
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(1024 * 1024)
  });

  await expect(page.locator('#file-details'))
    .toHaveText('valid-log.txt (1.00 MB)');

  // Select a different valid .txt file (2 MB)
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log-2.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(2 * 1024 * 1024)
  });

  // Verify details reflect the new selection
  await expect(page.locator('#file-details'))
    .toHaveText('valid-log-2.txt (2.00 MB)');

  // Verify previous details are no longer displayed
  await expect(page.getByText('valid-log.txt (1.00 MB)'))
    .toHaveCount(0);

  await expect(page.locator('#file-error')).toBeHidden();
});


test('shows validation error for empty files', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'empty-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(0)
  });

  await expect(page.locator('#file-error'))
    .toHaveText('Selected file is empty. Please upload a valid combat log file.');

  await expect(page.locator('#file-details')).toBeEmpty();
});


test('clears validation error when valid file is selected', async ({ page }) => {
  await page.goto('/');

  // Select invalid file
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'invalid-log.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid file contents')
  });

  await expect(page.locator('#file-error'))
    .toHaveText('Invalid file type. Please upload a .txt file.');

  // Replace with a valid file
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(1024 * 1024)
  });

  // Previous validation error should disappear
  await expect(page.locator('#file-error')).toBeHidden();

  // Valid file details should appear
  await expect(page.locator('#file-details'))
    .toHaveText('valid-log.txt (1.00 MB)');
});


test('clears file details when selection is removed', async ({ page }) => {
  await page.goto('/');

  // Select a valid file
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(1024 * 1024)
  });

  await expect(page.locator('#file-details'))
    .toHaveText('valid-log.txt (1.00 MB)');

  // Clear file selection
  await page.getByLabel('Combat log file').setInputFiles([]);

  // Previous file details should disappear
  await expect(page.locator('#file-details')).toBeEmpty();

  // Missing selection validation should appear
  await expect(page.locator('#file-error'))
    .toHaveText('No file selected.');
});


test('successful import displays inspection results', async ({ page }) => {
  await page.goto('/');
  // Select a valid combat log file
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n' +
      '10/16/2026 10:05:26.5341  SPELL_AURA_APPLIED,Player-123,Example\n'
    )
  });

  // Click the import button
  await page.getByRole('button', { name: 'Import Log' }).click();
  
  // Wait for the inspection results to be displayed
  await expect(page.locator('#results-content')).toContainText('Log Inspection Summary');
  await expect(page.locator('#results-content')).toContainText('Total records inspected: 2');
  await expect(page.locator('#results-content')).toContainText('Valid records: 2');
  await expect(page.locator('#results-content')).toContainText('Malformed records: 0');
});

test('completed processing status is displayed after import and controls are enabled', async ({ page }) => {

  await page.goto('/');

  // Select a valid combat log file
  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n' +
      '10/16/2026 10:05:26.5341  SPELL_AURA_APPLIED,Player-123,Example\n'
    )
  });

  // Click the import button
  await page.getByRole('button', { name: 'Import Log' }).click();

  // Wait for the processing status to be displayed
  await expect(page.locator('#processing-status')).toBeVisible();

  // Verify that the processing label indicates completion
  await expect(page.locator('#processing-label')).toHaveText('Inspection complete');

  // Verify that the import button is enabled after processing
  await expect(page.getByRole('button', { name: 'Import Log' })).toBeEnabled();

  // Verify that the file input is enabled after processing
  await expect(page.getByLabel('Combat log file')).toBeEnabled();

});

test('processing failure displays error and restores controls', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'valid-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n'
    )
  });

  // Simulate a failure when reading the selected file
  await page.evaluate(() => {
    const fileInput = document.querySelector<HTMLInputElement>('#log-file');
    const file = fileInput?.files?.[0];

    if (!file) {
      throw new Error('Test setup failed: no file selected');
    }

    Object.defineProperty(file, 'stream', {
      value: () => {
        throw new Error('Simulated file read failure');
      }
    });
  });

  await page.getByRole('button', { name: 'Import Log' }).click();

  // Verify error message
  await expect(page.locator('#file-error')).toHaveText(
    'An error occurred while processing the file.'
  );

  // Verify processing indicator is hidden
  await expect(page.locator('#processing-status')).toBeHidden();

  // Verify controls are restored
  await expect(
    page.getByRole('button', { name: 'Import Log' })
  ).toBeEnabled();

  await expect(
    page.getByLabel('Combat log file')
  ).toBeEnabled();
});

test('displays detected arena matches after importing a combat log', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'arena-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n' +
      '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n' +
      '10/27/2026 21:35:00.1000  ARENA_MATCH_END,1\n'
    )
  });

  await page.getByRole('button', { name: 'Import Log' }).click();

  // Verify the inspection results
  await expect(page.locator('#results-content'))
    .toContainText('Total records inspected: 3');

  // Verify one match was detected
  await expect(page.locator('#results-content'))
    .toContainText('Arena Matches (1)');

  const matches = page.locator('#arena-matches .list-group-item');

  await expect(matches).toHaveCount(1);

  // Verify match details
  await expect(matches.first()).toContainText('Match 1 — End recorded');
  await expect(matches.first()).toContainText('Rounds: 1');

  await expect(matches.first())
    .toContainText('Started: 10/27/2026 21:31:00.1000');

  await expect(matches.first())
    .toContainText('Ended: 10/27/2026 21:35:00.1000');

  // Verify processing completed successfully
  await expect(page.locator('#processing-label'))
    .toHaveText('Inspection complete');
});

test('displays a message when no arena matches are detected', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Combat log file').setInputFiles({
    name: 'no-arena-log.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      '10/27/2026 21:31:00.1000  ZONE_CHANGE,1504\n' +
      '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n'
    )
  });

  await page.getByRole('button', { name: 'Import Log' }).click();

  await expect(page.locator('#results-content'))
    .toContainText('Arena Matches (0)');

  await expect(page.locator('#arena-matches'))
    .toHaveText('No arena matches detected in this log.');

  await expect(page.locator('#processing-label'))
    .toHaveText('Inspection complete');
});