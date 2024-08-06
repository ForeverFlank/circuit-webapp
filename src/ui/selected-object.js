import { Editor } from "../editor/editor.js";

function updateSelectedCircuitObjectUI() {
    const div = document.getElementById("selecting-circuit-object-container");
    console.log(div.children)
    for (let i = 0, len = div.children.length; i < len; ++i) {
        div.children[i].style.display = "none";
    }

    if (Editor.selectedObject) {
        let name = Editor.selectedObject.name;
        if (name != null) {
            div.style.display = "flex";
            document.getElementById("selecting-name").style.display = "flex";
            document.getElementById("selecting-name").innerText = name;
            Editor.selectedObject.selected();
        } else {
            div.style.display = "none";
        }
    }
}

export { updateSelectedCircuitObjectUI }