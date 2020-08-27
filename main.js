const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')

let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
  win.once('closed', () => { win = null })
  win.on('blur', () => { win && win.hide() })

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Register a 'CommandOrControl+1' shortcut listener.
  globalShortcut.register('CmdOrCtrl+1', () => {
    win.show()
    win.restore()
  })
  ipcMain.on('hide', () => {
    app && app.hide()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    win = createWindow()
  } else {
    win.show()
    win.restore()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

