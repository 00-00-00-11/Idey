const { BrowserWindow, ipcMain } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path');

const ideFolderWindow = (folderPath) => {
    const ideFolderWin = new BrowserWindow({
        width: 1400,
        height: 900,

        show: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    ideFolderWin.setMenu(null);

    ideFolderWin.loadFile(path.join(__dirname, '../windows/ide_folder.html'));

    electronLocalshortcut.register(ideFolderWin, "Ctrl+R", () => {
        ideFolderWin.webContents.send("reload");
    });

    require('@electron/remote/main').enable(ideFolderWin.webContents);

    ipcMain.on("request_folder_path", (event, arg) => {
        event.reply("folder_path", folderPath);
    });

    //ideFolderWin.webContents.openDevTools();
};

module.exports = ideFolderWindow;