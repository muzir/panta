const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const clipboardy = require('clipboardy')
const AppDAO = require('./js/dao')

const ClipboardHistoryRepository = require('./js/clipboard_history_repository')

let win
let clipboardHistoryRepository
const RETENTION_PERIOD_IN_DAYS = 30

function createWindow() {
  // Create the browser window.
  const isRemoteModuleEnabled = process.env.PROFILE === 'integration'
  win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: isRemoteModuleEnabled, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    },
    title: app.getName() + ' v' + app.getVersion()
  })

  win.on('page-title-updated', function (e) {
    e.preventDefault()
  });

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

  ipcMain.on('write-clipboard', (event, value) => {
    clipboardy.writeSync(value)
    event.sender.send('write-clipboard-success', value)
  })

  ipcMain.on('read-clipboard', (event) => {
    const value = clipboardy.readSync()
    event.sender.send('read-clipboard-success', value)
  })

  ipcMain.on('create-table', () => {
    clipboardHistoryRepository.createTable()
  }),

    ipcMain.on('delete-by-retention-period', (value) => {
      clipboardHistoryRepository.deleteByRetentionPeriod(value)
    }),

    ipcMain.on('delete', (event, value) => {
      clipboardHistoryRepository.delete(value).then((data) => {
        event.sender.send('delete-success', data)
      })
    }),

    ipcMain.on('get-last-element', (event) => {
      clipboardHistoryRepository.getLastElement()
        .then((data) => {
          event.sender.send('get-last-element-success', data)
        })
    }),

    ipcMain.on('create', (event, value) => {
      clipboardHistoryRepository.create(value)
        .then((data) => {
          event.sender.send('create-success', value)
        })
    }),

    ipcMain.on('get-by-id', (event, value) => {
      clipboardHistoryRepository.getById(value)
        .then((data) => {
          event.sender.send('get-by-id-success', data)
        })
    }),

    ipcMain.on('get-by-search-key', (event, value) => {
      clipboardHistoryRepository.getBySearchKey(value).then((data) => {
        event.sender.send('get-by-search-key-success', data)
      })
    }),

    ipcMain.on('get-last-ten-elements', (event, value) => {
      clipboardHistoryRepository.getLastTenElements(value)
        .then((data) => {
          event.sender.send('get-last-ten-elements-success', data)
        })
    });

};

function createClipboardHistoryTableIfNotExists() {
  return clipboardHistoryRepository.createTable()
    .then(() => {
      return isTestProfileActive()
    })

  function isTestProfileActive() {
    return Promise.resolve(process.env.PROFILE === 'integration');
  }
}

function deleteRecordsOlderThanRetentionPeriod() {
  /* RETENTION_PERIOD_IN_DAYS days calculation */
  let dateOffset = (24 * 60 * 60 * 1000) * RETENTION_PERIOD_IN_DAYS
  let retentionDate = new Date(Date.now())
  if (process.env.PROFILE !== 'integration') {
    retentionDate.setTime(retentionDate.getTime() - dateOffset)
  }
  return Promise.resolve(clipboardHistoryRepository.deleteByRetentionPeriod(retentionDate))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  ipcMain.on("toMain", (event, args) => {
    // Do something with file contents
    const userDataPath = app.getPath('userData')
    const dao = new AppDAO(userDataPath + '/panta.db')
    clipboardHistoryRepository = new ClipboardHistoryRepository(dao)
    createClipboardHistoryTableIfNotExists().then(() => {
      deleteRecordsOlderThanRetentionPeriod()
        .then(() => {
          event.sender.send('read-file-success', 'success')
        })
        .catch(function (e) {
          console.error("Error in window onload! " + e)
        });
    });
  });
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

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
    app.whenReady().then(createWindow)
  } else {
    win.show()
    win.restore()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

