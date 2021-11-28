const { app, BrowserWindow, ipcMain } = require('electron');
require('@electron/remote/main').initialize();

const initProjectWindow = require('./windows_init/init_project');
const ideFolderWindow = require('./windows_init/ide_folder');
const ideFileWindow = require('./windows_init/ide_file');

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

ipcMain.on('open_folder', (event, arg) => {
  ideFolderWindow(arg);
  event.reply("close");
});

ipcMain.on('open_file', (event, arg) => {
  ideFileWindow(arg);
  event.reply("close");
});

ipcMain.on("exit_to_welcome_screen", (event, arg) => {
  initProjectWindow();
  event.reply("close");
});