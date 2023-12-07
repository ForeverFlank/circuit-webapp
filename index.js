var containerWidth = () => document.getElementById('canvas-container').clientWidth;
var containerHeight = () => document.getElementById('canvas-container').clientHeight;

function setup() {
    var canvas = createCanvas(containerWidth(), containerHeight());
    canvas.parent('canvas-container');

    canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))
}

function windowResized() {
    resizeCanvas(containerWidth(), containerHeight());
}

function draw() {
    mouseCanvasX = (mouseX - controls.view.x - containerWidth() / 2) / controls.view.zoom;
    mouseCanvasY = (mouseY - controls.view.y - containerHeight() / 2) / controls.view.zoom;

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
    document.getElementById('fps-counter').innerText = fps;
    // console.log(nodes)
}

function objectsPress() {
    let pressedOnObject = false;
    mouseClickedButton = mouseButton;
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

function touchStarted(e) {
    let pressedOnObject = objectsPress();

    if (pressedOnObject) {

    } else {
        if (mouseButton == LEFT)
            0;
        if (mouseButton == CENTER)
            Controls.move(controls).pressed(e);
    }    
}

function touchMoved(e) {
    for (let i = circuit.modules.length - 1; i >= 0; i--) {
        let module = circuit.modules[i];
        let nodes = module.inputs.concat(module.outputs);
        for (let j = nodes.length - 1; j >= 0; j--) {
            //if (nodes[j].dragged()) {
            // }
            let wires = nodes[j].connections;
            for (let k = wires.length - 1; k >= 0; k--) {
                // if (wires[k].dragged()) {
                // }
            }
        }
        module.dragged();
    }
    Controls.move(controls).dragged(e);
}

function touchEnded(e) {
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
}