// Integration test suite
const path = require("path");
const spectron = require("spectron");
const electronPath = require("electron");
const clipboardy = require('clipboardy')

const app = new spectron.Application({
  path: electronPath,
  args: [path.join(__dirname, "..")]
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(() => {
  return app.start();
}, 15000);


test("Displays App window", async function () {
  let windowCount = await app.client.getWindowCount();

  expect(windowCount).toBe(1);
});

test("random test", async function () {
  clipboardy.writeSync('pasta')
  app.client.waitUntilWindowLoaded()
  app.client.waitUntilTextExists('#1', 'pasta', 1000)
  await sleep(2000);
  const clippingText = await app.client.getText('#1')
  console.log('The text content is ' + clippingText)
});

afterAll(function () {
  if (app && app.isRunning()) {
    return app.stop();
  }
});

