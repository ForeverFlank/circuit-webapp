function getContainerWidth() {
    return document.getElementById('canvas-container').clientWidth;
}
function getContainerHeight() {
    return document.getElementById('canvas-container').clientHeight;
}

var containerWidth = getContainerWidth();
var containerHeight = getContainerHeight();

const DEBUG = 1;
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