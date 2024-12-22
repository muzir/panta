/** 
 * Example Playwright script for Electron
 * showing/testing various API features 
 * in both renderer and main processes
 */

import { expect, test } from '@playwright/test'
import { ElectronApplication, Page, _electron as electron } from 'playwright'


let electronApp: ElectronApplication;
let page: Page;
const delay = (ms: number | undefined) => new Promise(res => setTimeout(res, ms));

test.beforeEach(async () => {
  // set the CI environment variable to true
  process.env.PROFILE = 'integration'
  electronApp =  await electron.launch({ args: ['main.js', '--disable-gpu'],  });
  
  await electronApp.evaluate(({ clipboard }, text) => {
      clipboard.writeText(text);
    }, '');
  
    electronApp.on('window', async (page) => {
    const filename = page.url()?.split('/').pop()
    console.log(`Window opened: ${filename}`)

    // capture errors
    page.on('pageerror', (error) => {
      console.error(error)
    })
    // capture console messages
    page.on('console', (msg) => {
      console.log(msg.text())
    })
  })
})

test.afterEach(async () => {
  await electronApp.close()
})



test("Displays App window", async function () {
  // Wait for at least one window to open
  page = await electronApp.firstWindow()
  let windowCount = await electronApp.windows().length;

  expect(windowCount === 1).toBeTruthy()
});

test('renders the first page', async () => {
  page = await electronApp.firstWindow()
  const clipboardText = 'esek';  
  await electronApp.evaluate(({ clipboard }, text) => {
    clipboard.writeText(text);
  }, clipboardText);
  await delay(3000)
  //await expect(page.getByText('esek')).toBeVisible();
  const element = await page.getByText('esek');
  const value = await element.count()
  expect(value).toEqual(1);
})

// test("same element listed once if write the clipboard multiple times", async function () {
//   let clipboardText = '💖 pasta!';  
//   await electronApp.evaluate(({ clipboard }, text) => {
//     clipboard.writeText(text);
//   }, clipboardText);
//   await delay(550);
//   clipboardText = '💖 pasta1!';
//   await electronApp.evaluate(({ clipboard }, text) => {
//     clipboard.writeText(text);
//   }, clipboardText);
//   await delay(550);
//   clipboardText = '💖 pasta!';
//   await electronApp.evaluate(({ clipboard }, text) => {
//     clipboard.writeText(text);
//   }, clipboardText);
//   await delay(550);
//   const page = await electronApp.firstWindow();
//   const element = await page.getByText('💖 pasta!');
//   const element1 = await page.getByText('💖 pasta1!');
//   const value = await element.count()
//   const value1 = await element1.count()
//   expect(value).toEqual(1);
//   expect(value1).toEqual(1);
// });