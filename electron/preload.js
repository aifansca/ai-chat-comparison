const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('myAppAPI', {
    sendToMain: (channel, data) => ipcRenderer.send(channel, data),
    onFromMain: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})
