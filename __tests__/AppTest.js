const Application = require("spectron").Application;
const electron = require("electron");
const path = require("path");
const clipboardy = require('clipboardy')

let app;

jest.setTimeout(60000)
process.env.PROFILE = 'integration'

beforeEach(() => {
  app = new Application({
    path: electron,

    args: [path.join(__dirname, "../")]
  });

  return app.start();
}, 15000);

afterEach(function () {
  if (app && app.isRunning()) {
    return app.stop();
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("Displays App window", async function () {
  let windowCount = await app.client.getWindowCount();

  expect(windowCount).toBe(1);
});

test("first element listed in items after write to clipboard", async function () {
  clipboardy.writeSync('💖 pasta!')
  await sleep(200)
  const firstElement = await app.client.$("//*[@id=\"1\"]");
  let firstElementText = await firstElement.getText();
  expect(firstElementText).toBe('💖 pasta!');
});

test("Displays App title with app name and version", async function () {
  app.browserWindow.getTitle().then((title)=>{
    expect(title).toBe('panta v0.1.3');  
  })
});