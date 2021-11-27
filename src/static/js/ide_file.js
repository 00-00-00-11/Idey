const path = require('path');
const fs = require('fs');

ipcRenderer.send("request_file_path");

ipcRenderer.on("file_path", (event, arg) => {
    var filePath = arg;

    document.title = `${path.basename(filePath)} | Idey`;
});