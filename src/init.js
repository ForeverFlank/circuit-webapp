function getContainerWidth() {
    return document.getElementById('canvas-container').clientWidth;
}
function getContainerHeight() {
    return document.getElementById('canvas-container').clientHeight;
}

var containerWidth = getContainerWidth();
var containerHeight = getContainerHeight();

const DEBUG = 0;
const DEBUG_2 = 0;
const NODE_HOVERING_RADIUS = 10;

var mod = (a, b) => ((a % b) + b) % b;

var mouseCanvasX;
var mouseCanvasY;
function mouseUpdate() {
    mouseCanvasX = (mouseX - controls.view.x - containerWidth / 2) / controls.view.zoom;
    mouseCanvasY = (mouseY - controls.view.y - containerHeight / 2) / controls.view.zoom;
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

var uniqueNumber = 0;

function unique(str = '') {
    uniqueNumber++;
    return str + '_' + uniqueNumber.toString() + '_' + Math.floor(Math.random() * 2 ** 32).toString(16) + Date.now().toString(16);
}

function filterObject(obj, condition) {
    return Object.keys(obj)
        .filter(key => condition(obj[key], key))
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

function hoveringOnDiv(e) {
    let divIds = ['selecting-div', 'button-delete']
    for (let i in divIds) {
        let div = document.getElementById(divIds[i]);
        let offsets = div.getBoundingClientRect();
        let top = offsets.top;
        let left = offsets.left;
        let height = div.clientHeight;
        let width = div.clientWidth;
        if (mouseY > top &&
            mouseY < top + height &&
            mouseX > left &&
            mouseX < left + width) {
            return true;
        }
    }
    return false;
}

var sprites = {};
var fontRegular;
let spritesList = { 'basic': ['input', 'output', 'not', 'and', 'or', 'xor', 'nand', 'nor', 'xnor'] }
function preload() {
    
    Object.keys(spritesList).forEach((key) => {
        spritesList[key].forEach((item) => {
            sprites[`${key}/${item}`] = loadImage(`sprites/${key}/${item}.png`);
        });
    });
    /*
    sprites['not'] = loadImage('sprites/not.png');
    sprites['input'] = loadImage('sprites/input.png');
    sprites['output'] = loadImage('sprites/output.png');
    sprites['and'] = loadImage('sprites/and.png');
    sprites['nand'] = loadImage('sprites/nand.png');
    sprites['or'] = loadImage('sprites/or.png');
    sprites['nor'] = loadImage('sprites/nor.png');
    sprites['xor'] = loadImage('sprites/xor.png');
    sprites['xnor'] = loadImage('sprites/xnor.png');
    */

    fontRegular = loadFont('Inter-Regular.ttf');

}