function getContainerWidth() {
    return document.getElementById("canvas-container").clientWidth;
}
function getContainerHeight() {
    return document.getElementById("canvas-container").clientHeight;
}

var containerWidth = getContainerWidth();
var containerHeight = getContainerHeight();

const DEBUG = 1;
const DEBUG_2 = 0;
const NODE_HOVERING_RADIUS = 10;

var mod = (a, b) => ((a % b) + b) % b;

var mouseCanvasX;
var mouseCanvasY;
function mouseUpdate() {
    mouseCanvasX =
        (mouseX - controls.view.x - containerWidth / 2) / controls.view.zoom;
    mouseCanvasY =
        (mouseY - controls.view.y - containerHeight / 2) / controls.view.zoom;
}

var isDrawingWire = false;
var clickedNode;
function setClickedNode(node) {
    clickedNode = node;
}

var pressedObject = { id: 0 };
var pressedWire = { id: 0 };
var selectedObject = {};
var hoveringNode = {};

var placeX = 0;
var placeY = 0;

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
        "tristatebuffer"
    ],
};
function preload() {
    Object.keys(spritesList).forEach((key) => {
        spritesList[key].forEach((item) => {
            sprites[`${key}/${item}`] = loadImage(
                `sprites/${key}/${item}.png`
            );
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
    }
    else {
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
let selectingDiv = document.getElementById("selecting-div")

function openModalMenu(title, html) {
    modalTitle.innerText = title;
    modalContainer.innerHTML = html;
    modalMenu.style.display = "flex"
    bg.style.display = "block";
}

function closeModalMenu() {
    modalMenu.style.display = "none"
    bg.style.display = "none";
}

function hoveringOnDiv(e) {
    let divIds = ["top-tab", "gate-menu", "selecting-div", "control-tab"];
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