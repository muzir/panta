const Application = require("spectron").Application;
const path = require("path");
let electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
let appPath = path.join(__dirname, '..');
let app;

if (process.platform === 'win32') {
    electronPath += '.cmd';
}

beforeAll(() => {
  app = new Application({
    path: electronPath,

    args: [appPath]
  });

  console.log('The APP: ', app);
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