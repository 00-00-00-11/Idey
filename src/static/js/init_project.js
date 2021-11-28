const nodePath = require('path');

var dialog = remote.require('electron').dialog;

document.getElementById("open_folder").onclick = async (e) => {
    var path = await dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openDirectory'],
        title: "Open a folder",
        buttonLabel: "Open folder"
    });

    if (path.canceled) return;

    path = path.filePaths[0];

    ipcRenderer.send('open_folder', path);
}

const openFile = async (path) => {
    ipcRenderer.send('open_file', path);
};

document.getElementById("open_file").onclick = async (e) => {
    var path = await dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openFile'],
        title: "Open a file for Idey",
        buttonLabel: "Open file"
    });

    if (path.canceled) return;

    path = path.filePaths[0];

    openFile(path);
}

//Recent files

if (localStorage.getItem("history") && Array.isArray(JSON.parse(localStorage.getItem("history")))) {
    let history = JSON.parse(localStorage.getItem("history"));
    let recentProjectsList = document.getElementById("recent_projects");

    for (let i in history) {
        if (history[i].type == "file") {
            let className = (i % 2 == 0) ? "recent_item_even" : "recent_item_odd";

            let element = document.createElement(`div`);
            element.innerHTML = `<div class="${className}"><span class="mdi mdi-file"></span> ${escapeHTML(nodePath.basename(history[i].path))}</div>`;
            element = element.firstChild;

            element = recentProjectsList.insertAdjacentElement("beforeend", element);

            element.onclick = () => {
                openFile(history[i].path);
            };
        }
    }
}

//Close window

ipcRenderer.on('close', () => {
    remote.getCurrentWindow().close();
});