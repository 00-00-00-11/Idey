ipcRenderer.send("request_folder_path");

ipcRenderer.on("folder_path", (event, arg) => {
    var path = arg;
});