const path = require('path');
const fs = require('fs');

ipcRenderer.send("request_file_path");

var editor = null;
var langTools = null;
var filePath = null;

ipcRenderer.on("file_path", (event, arg) => {
    filePath = arg;

    document.title = `${path.basename(filePath)} | Idey`;

    langTools = ace.require("ace/ext/language_tools");

    editor = ace.edit("ide");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    editor.setValue(fs.readFileSync(filePath, "utf8"));
    var modelist = ace.require("ace/ext/modelist");
    var mode = modelist.getModeForPath(filePath).mode;
    editor.session.setMode(mode);

    editor.on("input", () => {
        document.getElementById("save_file").classList.remove("menu_button_unclickable");
    });

    ipcRenderer.send("init_ac");
});

const saveFile = (event) => {
    fs.writeFileSync(filePath, editor.getValue(), "utf8");
    document.getElementById("save_file").classList.add("menu_button_unclickable");

    if (localStorage.getItem("history") && Array.isArray(JSON.parse(localStorage.getItem("history")))) {
        let history = JSON.parse(localStorage.getItem("history"));

        for (let i in history) {
            if (history[i].path == filePath && history[i].type == "file") {
                history.splice(i, 1);
            }
        }

        localStorage.setItem("history", JSON.stringify([{ path: filePath, type: "file", time: Math.round(Date.now() / 1000) }, ...history]));
    } else {
        localStorage.setItem("history", JSON.stringify([{ path: filePath, type: "file", time: Math.round(Date.now() / 1000) }]));
    }
};

ipcRenderer.on("save_file", saveFile);
document.getElementById("save_file").onclick = saveFile;

document.getElementById("save_file_main_menu").onclick = () => {
    document.querySelector(".main_menu_container").classList.add("display_none");
    saveFile();
};

ipcRenderer.on('close', () => {
    remote.getCurrentWindow().close();
});