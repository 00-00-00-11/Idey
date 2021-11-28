const { Terminal } = require("xterm")


document.getElementById("terminal_btn").onclick = () => {
    document.querySelector(".file_ide_grid").classList.add("file_ide_grid_terminal");
    document.querySelector("#terminal").classList.remove("display_none");

    var term = new Terminal();
    term.open(document.getElementById('terminal'));
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

    term.resize()

}