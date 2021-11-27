ipcRenderer.send("request_file_path");

ipcRenderer.on("file_path", (event, arg) => {
    var path = arg;
});