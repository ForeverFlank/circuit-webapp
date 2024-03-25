function selectedObjectUI() {
    selectingDiv.children.forEach((element) => {
        element.style.display = "none";
    });

    let name = selectedObject.name;
    if (name != null) {
        selectingDiv.style.display = "flex";
        document.getElementById("selecting-name").style.display = "flex";
        document.getElementById("selecting-name").innerText = name;
        selectedObject.selected();
    } else {
        selectingDiv.style.display = "none";
    }
}