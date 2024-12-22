const {
  contextBridge,
  ipcRenderer
} = require("electron");


// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  send: (channel) => {
      ipcRenderer.send(channel);
      // Create a promise that resolves when the "read-file-success" event is received.
      // That even is sent from the main process when the file has been successfully read.
    return new Promise((resolve) =>
      ipcRenderer.once('read-file-success', (event, data) => resolve({ event, data }))
    )
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  writeSync: (value) => {
    ipcRenderer.send('write-clipboard', value);
    return new Promise((resolve) =>
      ipcRenderer.once('write-clipboard-success', (event, data) => resolve({ event, data }))
    )
  },
  readSync: () => {
    ipcRenderer.send('read-clipboard');
    return new Promise((resolve) =>
      ipcRenderer.once('read-clipboard-success', (event, data) => resolve({ event, data }))
    )
  },
  delete: (value) => {
    ipcRenderer.send('delete', value);
    return new Promise((resolve) =>
      ipcRenderer.once('delete-success', (event, data) => resolve({ event, data }))
    )
  },
  getLastElement: () => {
    ipcRenderer.send('get-last-element');
    return new Promise((resolve) =>
      ipcRenderer.once('get-last-element-success', (event, data) => resolve({ event, data }))
    )
  },
  create: (value) => {
    ipcRenderer.send('create', value);
    return new Promise((resolve) =>
      ipcRenderer.once('create-success', (event, data) => resolve({ event, data }))
    )
  },
  getById: (value) => {
    ipcRenderer.send('get-by-id', value);
    return new Promise((resolve) =>
      ipcRenderer.once('get-by-id-success', (event, data) => resolve({ event, data }))
    )
  },
  getBySearchKey: (value) => {
    ipcRenderer.send('get-by-search-key', value);
    return new Promise((resolve) =>
      ipcRenderer.once('get-by-search-key-success', (event, data) => resolve({ event, data }))
    )
  },
  getLastTenElements: (value) => {
    ipcRenderer.send('get-last-ten-elements', value);
    return new Promise((resolve) =>
      ipcRenderer.once('get-last-ten-elements-success', (event, data) => resolve({ event, data }))
    )
  },
}
);