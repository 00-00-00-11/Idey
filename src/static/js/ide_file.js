const path = require('path');
const fs = require('fs');

ipcRenderer.send("request_file_path");

ipcRenderer.on("file_path", (event, arg) => {
    var filePath = arg;

    document.title = `${path.basename(filePath)} | Idey`;

    var editor = ace.edit("ide");
    var modelist = ace.require("ace/ext/modelist");
    var mode = modelist.getModeForPath(filePath).mode;
    editor.session.setMode(mode);

    editor.setValue(fs.readFileSync(filePath, "utf8"));
});