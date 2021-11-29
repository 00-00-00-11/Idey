const fs = require('fs');
const path = require('path');

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

ipcRenderer.send("request_folder_path");

ipcRenderer.on("folder_path", (event, arg) => {
    let folderPath = arg;
    let folderName = path.basename(folderPath);

    document.getElementById("folder_name").innerHTML = escapeHTML(folderName);

    let entries = readDirectory(folderPath);

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

        element.onclick = () => {
            //todo
        };
    }

    for (let i in entries.files) {
        let item = entries.files[i];

        let className = (i % 2 == 0) ? "list_item_even" : "list_item_odd";

        let element = document.createElement(`div`);
        element.innerHTML = `<div class="${className}">
                <span class="mdi mdi-file"></span> ${escapeHTML(path.basename(item))}
                <span class="list_item_sub"></span>
            </div>`;
        element = element.firstChild;

        element = document.getElementById("path_list").insertAdjacentElement("beforeend", element);

        element.onclick = () => {
            if (document.querySelector(".list_item_active")) document.querySelector(".list_item_active").classList.remove("list_item_active");

            element.classList.add("list_item_active");

            switchEditor(item);
        };
    }
});

let ideCollection = {};
let ideElementCollection = {};

function switchEditor(filePath) {
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

            /*ide.getModel().onDidChangeContent((event) => {
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
}

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