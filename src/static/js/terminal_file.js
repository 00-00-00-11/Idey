const { Terminal } = require("xterm")


document.getElementById("terminal_btn").onclick = () => {
    document.querySelector(".file_ide_grid").classList.add("file_ide_grid_terminal");
    document.querySelector("#terminal").classList.remove("display_none");
    document.querySelector(".main_menu_container").classList.add("display_none");

    var term = new Terminal();
    term.open(document.getElementById('terminal'));
    term.write('TODO: Terminal')

    editor.resize();
}