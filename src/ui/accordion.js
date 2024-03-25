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