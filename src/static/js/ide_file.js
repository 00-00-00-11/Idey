const path = require('path');
const fs = require('fs');

const amdLoader = require("../../node_modules/monaco-editor/min/vs/loader");
const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;

const { emmetHTML } = require("emmet-monaco-es");

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, '../../node_modules/monaco-editor/min'))
});

self.module = undefined;

//Request current editor file path
ipcRenderer.send("request_file_path");

//Global variables
var ide = null;
var langTools = null;
var filePath = null;

//Runs when file path is requested
ipcRenderer.on("file_path", (event, arg) => {
    filePath = arg;

    document.title = `${path.basename(filePath)} | Idey`;

    let fileExtension = path.basename(filePath).split(".");
    fileExtension = fileTypes[fileExtension[fileExtension.length - 1]] || undefined;

    amdRequire(['vs/editor/editor.main'], function () {
        //Init editor
        ide = monaco.editor.create(document.getElementById('ide'), {
            value: fs.readFileSync(filePath, "utf-8"),
            language: fileExtension
        });

        ide.layout();

        window.onresize = () => {
            ide.layout();
        }

        //Save button highlighter

        ide.getModel().onDidChangeContent((event) => {
            document.getElementById("save_file").classList.remove("menu_button_unclickable");
        });

        //Command palette custom items

        ide.addAction({
            id: "save-file",
            label: "Save File",
            run: saveFile,
        });

        ide.addAction({
            id: "exit-to-main-menu",
            label: "Exit to main menu",
            run: exitToMainMenu,
        });

        //Emmet

        emmetHTML(
            monaco,
            ["html", "php", "phtml"]
        );
    });
});

const saveFile = (event) => {
    fs.writeFileSync(filePath, ide.getValue(), "utf8");
    document.getElementById("save_file").classList.add("menu_button_unclickable");

    if (localStorage.getItem("history") && Array.isArray(JSON.parse(localStorage.getItem("history")))) {
        let history = JSON.parse(localStorage.getItem("history"));

        for (let i in history) {
            if (history[i].path == filePath && history[i].type == "file") {
                history.splice(i, 1);
            }
        }

        localStorage.setItem("history", JSON.stringify([{ path: filePath, type: "file", time: Math.floor(Date.now() / 1000) }, ...history]));
    } else {
        localStorage.setItem("history", JSON.stringify([{ path: filePath, type: "file", time: Math.floor(Date.now() / 1000) }]));
    }
};

const exitToMainMenu = () => {
    ipcRenderer.send("exit_to_welcome_screen");
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