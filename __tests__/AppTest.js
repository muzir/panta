const { _electron: electron } = require('playwright');
const path = require("path");
const clipboardy = require('clipboardy')

let electronApp;

jest.setTimeout(1000)
process.env.PROFILE = 'integration'

const delay = ms => new Promise(res => setTimeout(res, ms));

beforeEach(async () => {
  electronApp =  await electron.launch({ args: ['.'],  });
}, 15000);


test("Displays App window", async function () {
  let windowCount = await electronApp.windows().length;
  expect(windowCount === 1).toBeTruthy()
});

test("first element listed in items after write to clipboard", async function () {
  clipboardy.writeSync('💖 pasta!')
  const window = await electronApp.firstWindow();
  const element = await window.locator('xpath=/html/body/div/div/ul/div/li[1]/div/p');
  const value = await element.innerText()
  expect(value === '💖 pasta!').toBeTruthy();
});

test("same element listed once if write the clipboard multiple times", async function () {
  clipboardy.writeSync('💖 pasta!')
  await delay(250);
  clipboardy.writeSync('💖 pasta1!')
  await delay(250);
  clipboardy.writeSync('💖 pasta!')
  await delay(250);
  const window = await electronApp.firstWindow();
  const element = await window.locator('xpath=/html/body/div/div/ul/div/li');
  const value = await element.count()
  expect(value).toEqual(2);
});

test("Test app name and version", async () => {
  const appName = await electronApp.evaluate(async ({ app }) => {
    return  app.getName();
  });
  const appVersion = await electronApp.evaluate(async ({ app }) => {
    return  app.getVersion();
  });
  expect(appVersion).toBe("0.1.6");
  expect(appName).toBe("panta");
});

afterEach(async () => {
  await electronApp.close();
});