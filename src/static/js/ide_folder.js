//Regular includes
const fs = require('fs');
const path = require('path');

//Requirements for Monaco
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
//End - Requirements for Monaco

//Request path of current folder
ipcRenderer.send("request_folder_path");

//File list elements
let fileViewElements = {};

let folderPath = null;
let currentSubPath = "/";

//Runs when folder path is received
ipcRenderer.on("folder_path", (event, arg) => {
    folderPath = path.normalize(arg);
    let folderName = path.basename(folderPath);

    makeFileView();
});
//End - Runs when folder path is received

//Function for displaying files in current path
function makeFileView() {
    document.getElementById("path_list").innerHTML = "";

    let entries = readDirectory(path.join(folderPath, currentSubPath));

    console.log(currentSubPath)

    if (currentSubPath !== "/" && currentSubPath !== "\\") {
        entries.folders = ["..", ...entries.folders];
    }

    for (let i in entries.folders) {
        let item = entries.folders[i];

        let className = (i % 2 == 0) ? "list_item_even" : "list_item_odd";

        let element = document.createElement(`div`);
        element.innerHTML = `<div class="${className}">
                <span class="mdi mdi-folder"></span> ${escapeHTML(path.basename(item))}
                <span class="list_item_sub"></span>
            </div>`;
        element = element.firstChild;

        element = document.getElementById("path_list").insertAdjacentElement("beforeend", element);

        if (item == "..") {
            element.onclick = () => {
                currentSubPath = path.join(currentSubPath, "..");
                makeFileView();
            };
        } else {
            element.onclick = () => {
                currentSubPath = path.join(currentSubPath, path.basename(item));
                makeFileView();
            };
        }
    }

    for (let i in entries.files) {
        let item = entries.files[i];

        let className = (i % 2 == 0) ? "list_item_even" : "list_item_odd";

        let element = document.createElement(`div`);
        element.innerHTML = `<div class="${className}">
                <span class="mdi mdi-file"></span>
                <span class="filename">${escapeHTML(path.basename(item))}</span>
                <span class="list_item_sub"></span>
            </div>`;
        element = element.firstChild;

        element = document.getElementById("path_list").insertAdjacentElement("beforeend", element);

        fileViewElements[item] = element;

        element.onclick = () => {
            if (document.querySelector(".list_item_active")) document.querySelector(".list_item_active").classList.remove("list_item_active");

            element.classList.add("list_item_active");

            switchEditor(item);
        };
    }

    document.getElementById("folder_name").innerHTML = escapeHTML(path.join(path.basename(folderPath), currentSubPath));
}
//End - Function for displaying files in current path

//Path to current file
let currentFile = null;

//File actions
const saveFile = (_filePath = currentFile) => {
    let filePath = path.normalize(_filePath);

    fs.writeFileSync(filePath, ideCollection[filePath].getValue(), "utf-8");

    fileViewElements[filePath].querySelector(".filename").innerHTML = escapeHTML(path.basename(filePath));

    //Add folder to history
    if (localStorage.getItem("history") && Array.isArray(JSON.parse(localStorage.getItem("history")))) {
        let history = JSON.parse(localStorage.getItem("history"));

        for (let i in history) {
            if (history[i].path == folderPath && history[i].type == "folder") {
                history.splice(i, 1);
            }
        }

        localStorage.setItem("history", JSON.stringify([{ path: folderPath, type: "folder", time: Math.floor(Date.now() / 1000) }, ...history]));
    } else {
        localStorage.setItem("history", JSON.stringify([{ path: folderPath, type: "folder", time: Math.floor(Date.now() / 1000) }]));
    }
};
//End - File actions

//Collection of Monaco instances
let ideCollection = {};
//Collection of IDE elements
let ideElementCollection = {};

//Called when editor should be switched to a different file
function switchEditor(_filePath) {
    let filePath = path.normalize(_filePath);

    if (document.querySelector(`.ide:not(.display_none)`)) {
        document.querySelector(`.ide:not(.display_none)`).classList.add("display_none");
    }

    //Create new editor element
    if (!ideElementCollection[filePath]) {
        let editorElement = document.createElement("div");
        editorElement.innerHTML = `<div class="ide"></div>`;
        editorElement = editorElement.firstChild;
        document.querySelector(".ide_container").insertAdjacentElement("beforeend", editorElement);

        ideElementCollection[filePath] = editorElement;

        //Make editor
        let fileExtension = path.basename(filePath).split(".");
        fileExtension = fileTypes[fileExtension[fileExtension.length - 1]] || undefined;

        amdRequire(['vs/editor/editor.main'], function () {
            //Init editor
            let ide = monaco.editor.create(editorElement, {
                value: fs.readFileSync(filePath, "utf-8"),
                language: fileExtension
            });

            ideCollection[filePath] = ide;

            ide.layout();

            window.onresize = () => {
                ide.layout();
            }

            //Save button highlighter

            ide.getModel().onDidChangeContent((event) => {
                fileViewElements[filePath].querySelector(".filename").innerHTML = "•&nbsp;&nbsp;" + escapeHTML(path.basename(filePath));
            });
    
            //Command palette custom items
    
            ide.addAction({
                id: "save-file",
                label: "Save File",
                run: () => { saveFile(filePath); },
            });
    
            /*ide.addAction({
                id: "exit-to-main-menu",
                label: "Exit to main menu",
                run: exitToMainMenu,
            });*/

            //Emmet

            emmetHTML(
                monaco,
                ["html", "htm", "php", "phtml"]
            );
        });
    } else {
        ideElementCollection[filePath].classList.remove("display_none");

        ideCollection[filePath].layout();

        window.onresize = () => {
            ideCollection[filePath].layout();
        }
    }

    currentFile = path.normalize(filePath);
}
//End - Called when editor should be switched to a different file

function readDirectory(folderPath) {
    let entries = fs.readdirSync(folderPath, { withFileTypes: true });

    let folders = [];
    let files = [];

    for (let i in entries) {
        if (entries[i].isDirectory()) {
            folders.push(path.join(folderPath, entries[i].name));
        }

        if (entries[i].isFile()) {
            files.push(path.join(folderPath, entries[i].name));
        }
    }

    return { folders, files };
}

//Application Menu
let menu = [
    {
        label: "File",
        submenu: [
            {
                label: "Save",
                accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
                click: () => {
                    saveFile();
                }
            }
        ]
    }
];

menu = remote.Menu.buildFromTemplate(menu);
remote.Menu.setApplicationMenu(menu);