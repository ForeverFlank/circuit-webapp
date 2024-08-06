let textures = {};

let texturesList = {
    basic: [
        "input",
        "output",
        "not",
        "and",
        "or",
        "xor",
        "nand",
        "nor",
        "xnor",
        "tristatebuffer",
    ],
};

function preloadTextures() {
    Object.keys(texturesList).forEach((key) => {
        texturesList[key].forEach((item) => {
            textures[`${key}/${item}`] = PIXI.Assets.load(`sprites/${key}/${item}.png`);
        });
    });
}

export { textures, preloadTextures }
/*
function getContainerWidth(id = "canvas-container") {
    return document.getElementById(id).clientWidth;
}
function getContainerHeight(id = "canvas-container") {
    return document.getElementById(id).clientHeight;
}

var containerWidth = getContainerWidth();
var containerHeight = getContainerHeight();

const DEBUG = 0;
const DEBUG_2 = 0;
const NODE_HOVERING_RADIUS = 10;

var mod = (a, b) => ((a % b) + b) % b;

var mouseCanvasX;
var mouseCanvasY;
var placeX = 0;
var placeY = 0;
var cameraCenterX = 0;
var cameraCenterY = 0;

function mouseUpdate() {
    let x = mouseX;
    let y = mouseY;

    
    if (touches.length > 0) {
        if (touches[0].x != null && touches[0].y != null) {
            x = touches[0].x;
            y = touches[0].y;
        }
        // console.log(touches[0].x, touches[0].y)
    }
    
    mouseCanvasX =
        (x - controls.view.x - containerWidth / 2) / controls.view.zoom;
    mouseCanvasY =
        (y - controls.view.y - containerHeight / 2) / controls.view.zoom;
    placeX = -controls.view.x / controls.view.zoom;
    placeY = -controls.view.y / controls.view.zoom;
    placeX = Math.round(placeX / 20) * 20;
    placeY = Math.round(placeY / 20) * 20;
    // placeX = Math.round(mouseCanvasX / 20) * 20;
    // placeY = Math.round(mouseCanvasY / 20) * 20;
}

var isDrawingWire = false;
var clickedNode;
function setClickedNode(node) {
    clickedNode = node;
}

var pressedObject = { id: 0 };
var pressedWire = { id: 0 };
var selectedObject = {};
var selectedWire = {};
var hoveringNode = {};

let sequentialModuleList = ["SR Latch", "D Latch"];

var uniqueNumber = 0;

function unique(str = "") {
    uniqueNumber++;
    return (
        str +
        "_" +
        uniqueNumber.toString() +
        "_" +
        Math.floor(Math.random() * 2 ** 32).toString(16) +
        Date.now().toString(16)
    );
}

function filterObject(obj, condition) {
    return Object.keys(obj)
        .filter((key) => condition(obj[key], key))
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

var sprites = {};
var fontRegular;
let spritesList = {
    basic: [
        "input",
        "output",
        "not",
        "and",
        "or",
        "xor",
        "nand",
        "nor",
        "xnor",
        "tristatebuffer",
    ],
};
function preload() {
    Object.keys(spritesList).forEach((key) => {
        spritesList[key].forEach((item) => {
            sprites[`${key}/${item}`] = loadImage(`sprites/${key}/${item}.png`);
        });
    });

    fontRegular = loadFont("Inter-Regular.ttf");
}

function pushAlert(level, message) {
    let container = document.getElementById("alert-container");
    let element;
    if (level == "error") {
        element = document.getElementById("alert-error");
    } else if (level == "info") {
        element = document.getElementById("alert-info");
    } else {
        return false;
    }
    let clone = element.cloneNode(true);
    clone.innerText = message;
    clone.style.display = "block";
    container.appendChild(clone);

    setTimeout(() => {
        clone.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 1000,
        });
    }, 3000);

    setTimeout(() => {
        clone.remove();
    }, 4000);
}

let bg = document.getElementById("background-blur");
let modalMenu = document.getElementById("modal-menu");
let modalTitle = document.getElementById("modal-title");
let modalContainer = document.getElementById("modal-container");
let selectingDiv = document.getElementById("selecting-circuit-object-container");

function openModalMenu(title, html) {
    modalTitle.innerText = title;
    modalContainer.innerHTML = html;
    modalMenu.style.display = "flex";
    bg.style.display = "block";
}

function closeModalMenu() {
    modalMenu.style.display = "none";
    bg.style.display = "none";
}

function hoveringOnDiv(e) {
    let divIds = ["top-tab", "gate-menu", "selecting-circuit-object-container", "control-tab"];
    for (let i in divIds) {
        let div = document.getElementById(divIds[i]);
        let offsets = div.getBoundingClientRect();
        let top = offsets.top;
        let left = offsets.left;
        let height = div.clientHeight;
        let width = div.clientWidth;
        if (
            mouseY > top &&
            mouseY < top + height &&
            mouseX > left &&
            mouseX < left + width
        ) {
            return true;
        }
    }
    if (bg.style.display != "none") return true;
    return false;
}
*/