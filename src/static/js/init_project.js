var dialog = remote.require('electron').dialog;

document.getElementById("open_folder").onclick = async (e) => {


    var path = await dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openDirectory'],
        title: "Open a folder for Idey",
        buttonLabel: "Open folder"
    });

    if (path.canceled)
        return


    path = path.filePaths[0]
}

document.getElementById("open_file").onclick = async (e) => {


    var path = await dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openFile'],
        title: "Open a file for Idey",
        buttonLabel: "Open file"
    });

    if (path.canceled)
        return

    path = path.filePaths[0]
}
