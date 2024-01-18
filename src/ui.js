function openGateMenu(id, mode) {
    let div = document.getElementById(id);
    if (div.style.display == mode) {
        div.style.display = 'none';
    } else {
        div.style.display = mode;
    }
}