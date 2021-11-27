const { app, BrowserWindow } = require('electron');
require('@electron/remote/main').initialize();

const initProjectWindow = require('./windows_init/init_project');

if (require('electron-squirrel-startup')) {
  app.quit();
}

app.on('ready', initProjectWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initProjectWindow();
  }
});