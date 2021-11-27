const { BrowserWindow } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const path = require('path');

const initProjectWindow = () => {
    const initProjectWin = new BrowserWindow({
        width: 600,
        height: 400,

        show: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    initProjectWin.setMenu(null);

    initProjectWin.loadFile(path.join(__dirname, '../windows/initproject.html'));

    electronLocalshortcut.register(initProjectWin, "Ctrl+R", () => {
        initProjectWin.webContents.send("reload");
    });

    require('@electron/remote/main').enable(initProjectWin.webContents);

    //initProjectWin.webContents.openDevTools();
};

module.exports = initProjectWindow;