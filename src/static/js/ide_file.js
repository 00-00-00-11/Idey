const path = require('path');
const fs = require('fs');

ipcRenderer.send("request_file_path");

var editor = null;
var filePath = null;

ipcRenderer.on("file_path", (event, arg) => {
    filePath = arg;

    document.title = `${path.basename(filePath)} | Idey`;

    editor = ace.edit("ide");
    editor.setValue(fs.readFileSync(filePath, "utf8"));
    var modelist = ace.require("ace/ext/modelist");
    var mode = modelist.getModeForPath(filePath).mode;
    editor.session.setMode(mode);

    editor.on("input", () => {
        document.getElementById("save_file").classList.remove("menu_button_unclickable");
    });
});

const saveFile = (event) => {
    fs.writeFileSync(filePath, editor.getValue(), "utf8");
    document.getElementById("save_file").classList.add("menu_button_unclickable");
};

ipcRenderer.on("save_file", saveFile);
document.getElementById("save_file").onclick = saveFile;