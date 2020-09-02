const Application = require("spectron").Application;
const electronPath = require("electron");
const path = require("path");
const clipboardy = require('clipboardy')

let app;

beforeAll(() => {
  app = new Application({
    path: electronPath,

    args: [path.join(__dirname, "../")]
  });

  return app.start();
}, 15000);

afterAll(function () {
  if (app && app.isRunning()) {
    return app.stop();
  }
});

test("Displays App window", async function () {
  let windowCount = await app.client.getWindowCount();

  expect(windowCount).toBe(1);
});

test("first element listed in items after write to clipboard", async function () {
  clipboardy.writeSync('💖 pasta!')
  const firstElement = await app.client.$("//*[@id=\"1\"]");
  let firstElementText = await firstElement.getText();
  expect(firstElementText).toBe("💖 pasta!");
});