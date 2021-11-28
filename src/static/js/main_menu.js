function initMainMenu(querySelector) {
    var btn = document.querySelector(querySelector);

    btn.onclick = () => {
        document.querySelector(".main_menu_container").classList.remove("display_none");
    };

    document.querySelector(".main_menu").onclick = (event) => {
        event.stopPropagation();
    };

    document.querySelector(".main_menu_container").onclick = () => {
        document.querySelector(".main_menu_container").classList.add("display_none");
    };

    document.getElementById("exit_to_welcome_screen").onclick = () => {
        ipcRenderer.send("exit_to_welcome_screen");
    };
}