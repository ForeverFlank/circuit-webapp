import { mouseUpdate, containerWidth, containerHeight, circuit, setPressedObjectID, clickedNode, setClickedNode } from "./classes";
import { Controls, controls } from "./camera";

function setup() {
    var canvas = createCanvas(containerWidth(), containerHeight());
    canvas.parent('canvas-container');

    canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))
}

function windowResized() {
    resizeCanvas(containerWidth(), containerHeight());
}

function draw() {
    mouseUpdate();

    // console.log(controls.view)
    translate(containerWidth() / 2, containerHeight() / 2);
    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom);

    noStroke();
    background(250);
    fill(230);
    for (let y = -500; y <= 500; y += 20) {
        for (let x = -500; x <= 500; x += 20) {
            ellipse(x, y, 5, 5);
        }
    }
    rect(-5, -5, 10, 10);
    stroke(0);
    strokeWeight(2);
    fill(255);

    let nodes = [];
    circuit.modules.forEach((x) => {
        nodes = nodes.concat(x.inputs).concat(x.outputs);
    });
    let wires = [];
    nodes.forEach((x) => {
        wires = wires.concat(x.connections);
    });

    circuit.modules.forEach((x) => { x.render() });
    wires.forEach((x) => x.render());
    nodes.forEach((x) => x.render());

    let fps = frameRate();
    document.getElementById('fps-counter').innerText = fps.toString(2);
    // console.log(nodes)
    // console.log(pressedObjectID)
}

function objectsPress() {
    mouseUpdate();
    let pressedOnObject = false;
    for (let i = circuit.modules.length - 1; i >= 0; i--) {
        let module = circuit.modules[i];
        let nodes = module.inputs.concat(module.outputs);
        for (let j = nodes.length - 1; j >= 0; j--) {
            if (nodes[j].pressed()) {
                pressedOnObject = true;
                break;
            }
            let wires = nodes[j].connections;
            for (let k = wires.length - 1; k >= 0; k--) {
                if (wires[k].pressed()) {
                    pressedOnObject = true;
                    break;
                }
            }
        }
        if (module.pressed()) {
            pressedOnObject = true;
            break;
        }
    }
    return pressedOnObject;
}

var released = false;

function touchStarted(e) {
    console.log(e)
    // if (e.type != 'touchstart') return;
    released = false;
    console.log('start')
    let pressedOnObject = objectsPress();

    if (pressedOnObject) {

    } else {
        if (mouseButton == LEFT)
            0;
        if (mouseButton == CENTER)
            Controls.move(controls).pressed(e);
    }
    // return true;
}

function touchMoved(e) {
    let pressedOnObject = false;
    for (let i = circuit.modules.length - 1; i >= 0; i--) {
        let module = circuit.modules[i];
        let nodes = module.inputs.concat(module.outputs);
        for (let j = nodes.length - 1; j >= 0; j--) {
            if (nodes[j].pressed()) {
                pressedOnObject = true;
                break;
            }
            let wires = nodes[j].connections;
            for (let k = wires.length - 1; k >= 0; k--) {
                if (wires[k].pressed()) {
                    pressedOnObject = true;
                    break;
                }
            }
        }
        if (module.pressed()) {
            pressedOnObject = true;
            break;
        }
    }
    Controls.move(controls).dragged(e);
}

function touchEnded(e) {
    if (!released) {
        console.log('end')
        let releasedOnObject = false;
        circuit.modules.forEach((x) => {
            x.released();
            let nodes = x.inputs.concat(x.outputs);
            for (let i in nodes) {
                if (nodes[i].released()) {
                    releasedOnObject = true;
                }
            }
        });
        if (!releasedOnObject) {
            if (clickedNode != null) {
                clickedNode.addWireNode();
            }
        }
        Controls.move(controls).released(e);
        // selected = false;
    }
    setPressedObjectID(0);
    released = true;
    // return false;
}

const isTouchDevice =  function() {
    const is_or_not =  'ontouchstart' in window        // works on most browsers 
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface

    return is_or_not ? true : false; // Fix to always return true or false
};