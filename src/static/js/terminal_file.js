document.getElementById("terminal_btn").onclick = () => {
    document.querySelector(".file_ide_grid").classList.add("file_ide_grid_terminal");
    document.querySelector("#terminal").classList.remove("display_none");

    //hey mauro do whatever you want
    //maybe use xterm?
}