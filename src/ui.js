bg.addEventListener("click", () => {
    closeMenu();
    closeModalMenu();
});

function openAccordionMenu(id, mode, arrowId = null) {
    let div = document.getElementById(id);
    if (div.style.display == mode) {
        div.style.display = "none";
    } else {
        div.style.display = mode;
    }
    if (arrowId != null) {
        let rotation =
            div.style.display == mode ? "rotate(180deg)" : "rotate(0)";
        document.getElementById(arrowId).style.transform = rotation;
    }
}

function closeAccordionMenu(id) {
    let div = document.getElementById(id);
    div.style.display = "none";
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
                "white";
            document.getElementById(`control-${item}`).style.color = "black";
        }
    });
}
setControlMode("edit");

function selectedObjectUI() {
    selectingDiv.children.forEach((element) => {
        element.style.display = "none";
    });

    let name = selectedObject.name;
    if (name != null) {
        selectingDiv.style.display = "flex";
        document.getElementById("selecting-name").style.display = "flex";
        document.getElementById("selecting-name").innerText = name;
        /*
        if (selectedObject.type == "node") {
            if (
                !selectedObject.isInputNode() &&
                !selectedObject.isOutputNode() &&
                !selectedObject.isSplitterNode()
            ) {
                document.getElementById("selecting-remove").style.display =
                    "flex";
            }
        } else {
            document.getElementById("selecting-remove").style.display = "flex";
        }
        */
        selectedObject.selected();
    } else {
        selectingDiv.style.display = "none";
    }
}

