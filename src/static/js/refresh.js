const { ipcRenderer } = require('electron');

ipcRenderer.on("reload", (event) => {
    window.location.reload();
});