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

const openFolder = async (path) => {
    ipcRenderer.send('open_folder', path);
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

function timeCalc(timestamp) {
    let now = Math.floor(Date.now() / 1000);

    let seconds = Math.floor(now - timestamp);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let months = Math.floor(days / 30);
    let years = Math.floor(days / 365);

    if (seconds < 60) {
        return `${seconds} seconds ago`;
    } else if (minutes < 60) {
        return `${minutes} minutes ago`;
    } else if (hours < 24) {
        return `${hours} hours ago`;
    } else if (days < 30) {
        return `${days} days ago`;
    } else if (days < 365) {
        return `${months} months ago`;
    } else {
        return `${years} years ago`;
    }
}

if (localStorage.getItem("history") && Array.isArray(JSON.parse(localStorage.getItem("history")))) {
    let history = JSON.parse(localStorage.getItem("history"));
    let recentProjectsList = document.getElementById("recent_projects");

    for (let i in history) {
        if (history[i].type == "file") {
            let className = (i % 2 == 0) ? "list_item_even" : "list_item_odd";

            let element = document.createElement(`div`);
            element.innerHTML = `<div class="${className}">
                <span class="mdi mdi-file"></span> ${escapeHTML(nodePath.basename(history[i].path))}
                <span class="list_item_sub">&nbsp;&nbsp;${escapeHTML(timeCalc(history[i].time))}</span>
            </div>`;
            element = element.firstChild;

            element = recentProjectsList.insertAdjacentElement("beforeend", element);

            element.onclick = () => {
                openFile(history[i].path);
            };
        }

        if (history[i].type == "folder") {
            let className = (i % 2 == 0) ? "list_item_even" : "list_item_odd";

            let element = document.createElement(`div`);
            element.innerHTML = `<div class="${className}">
                <span class="mdi mdi-folder"></span> ${escapeHTML(nodePath.basename(history[i].path))}
                <span class="list_item_sub">&nbsp;&nbsp;${escapeHTML(timeCalc(history[i].time))}</span>
            </div>`;
            element = element.firstChild;

            element = recentProjectsList.insertAdjacentElement("beforeend", element);

            element.onclick = () => {
                openFolder(history[i].path);
            };
        }
    }
}

//Settings
document.getElementById("dark_mode").onclick = () => {
    if (localStorage.getItem("dark_mode")) {
        localStorage.removeItem("dark_mode");
        document.body.classList.remove("dark_mode");
        return;
    }

    if (!localStorage.getItem("dark_mode")) {
        localStorage.setItem("dark_mode", "on");
        document.body.classList.add("dark_mode");
        return;
    }
};

//Close window
ipcRenderer.on('close', () => {
    remote.getCurrentWindow().close();
});