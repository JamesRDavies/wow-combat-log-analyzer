
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
