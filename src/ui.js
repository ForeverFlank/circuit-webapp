let bg = document.getElementById('background-blur');
bg.addEventListener('click', closeMenu);

function openMenu(id, mode) {
    let div = document.getElementById(id);
    if (div.style.display == mode) {
        div.style.display = 'none';
    } else {
        div.style.display = mode;
    }
}

function openSaveMenu() {
    let div = document.getElementById('save-menu');
    div.style.display = 'block';
    bg.style.display = 'block';
}

function openLoadMenu() {

}

function closeMenu() {
    let saveDiv = document.getElementById('save-menu');
    saveDiv.style.display = 'none';
    bg.style.display = 'none';
}