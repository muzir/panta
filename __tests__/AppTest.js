const { _electron: electron } = require('playwright');
const path = require("path");
const clipboardy = require('clipboardy')

let app;

jest.setTimeout(10000)
process.env.PROFILE = 'integration'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeEach(async () => {
    app =  await electron.launch({ args: ['main.js'] });
}, 15000);



test("Displays App window", async function () {
  let windowCount = await app.windows().length;
  expect(windowCount === 1).toBeTruthy()
});

test("first element listed in items after write to clipboard", async function () {
  clipboardy.writeSync('💖 pasta!')
  await sleep(200)
  const window = await app.firstWindow();
  const value = await window.locator('//*[@id=\"1\"]').inputValue();
  expect(value === '💖 pasta!').toBeTruthy();
});

afterEach(async () => {
  await app.close();
});