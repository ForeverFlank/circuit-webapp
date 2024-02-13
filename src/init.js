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

function isInputModule(m) {
    return ["Input", "N-bit Input"].includes(m.name);
}

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

var gridNodeLookup = {};
var pressedObject = { id: 0 };
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

function hoveringOnDiv(e) {
    let divIds = ["gate-menu", "selecting-div", "control-tab"];
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
    return false;
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
