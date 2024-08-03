/*
bg.addEventListener("click", () => {
    closeMenu();
    closeModalMenu();
});

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

var controlMode;
const controlModes = ["edit", "pan", "delete"];
function setControlMode(mode) {
    controlMode = mode;
    controlModes.forEach((item) => {
        if (item == mode) {
            let color = item == "delete" ? "#ef4444" : "#3b82f6";
            document.getElementById(`control-${item}`).style.backgroundColor =
                color;
            document.getElementById(`control-${item}`).style.color = "white";
        } else {
            document.getElementById(`control-${item}`).style.backgroundColor =
                "rgb(244, 244, 245)";
            document.getElementById(`control-${item}`).style.color = "black";
        }
    });
}
setControlMode("edit");
*/

