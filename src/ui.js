let bg = document.getElementById("background-blur");
bg.addEventListener("click", closeMenu);

function openMenu(id, mode) {
    let div = document.getElementById(id);
    if (div.style.display == mode) {
        div.style.display = "none";
    } else {
        div.style.display = mode;
    }
}

function openSaveMenu() {
    let div = document.getElementById("save-menu");
    div.style.display = "block";
    bg.style.display = "block";
}

function openLoadMenu() {}

function closeMenu() {
    let saveDiv = document.getElementById("save-menu");
    saveDiv.style.display = "none";
    bg.style.display = "none";
}

var controlMode = "edit";
const controlModes = ["edit", "pan", "delete"];
function setControlMode(mode) {
    controlMode = mode;
    controlModes.forEach((item) => {
        if (item == mode) {
            let color = item == "delete" ? "#ef4444" : "#3b82f6";
            document.getElementById(`control-${item}`).style.backgroundColor = color;
            document.getElementById(`control-${item}`).style.color = "white";
        } else {
            document.getElementById(`control-${item}`).style.backgroundColor = "white";
            document.getElementById(`control-${item}`).style.color = "black";
        }
    });
}
