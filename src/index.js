p5.disableFriendlyErrors = true;

var controlMode = 'edit';
function setControlMode(mode) {
    controlMode = mode;
}

function setup() {
    var canvas = createCanvas(containerWidth, containerHeight);
    canvas.parent('canvas-container');
}

function windowResized() {
    containerWidth = getContainerWidth();
    containerHeight = getContainerHeight();
    resizeCanvas(containerWidth, containerHeight);
}

function grid() {
    let view = controls.view;
    let width = containerWidth;
    let height = containerHeight
    let roundedWidth = 40 * ceil(width / 40);
    let roundedHeight = 40 * ceil(height / 40);
    let zoom = view.zoom;
    push();
    noStroke();
    
    fill(218);
    stroke(218);
    strokeWeight(1);
    let startX = floor((-view.x - roundedWidth / 2) / 20 / zoom) * 20;
    let startY = floor((-view.y - roundedHeight / 2) / 20 / zoom) * 20 ;
    let endX = ceil((-view.x + roundedWidth / 2) / 20 / zoom) * 20;
    let endY = ceil((-view.y + roundedHeight / 2) / 20 / zoom) * 20;
    for (let x = startX; x <= endX; x += 20) {
        line(x, startY, x, endY);
    }
    for (let y = startY; y <= endY; y += 20) {
        line(startX, y, endX, y);
    }
    // rect(-5, -5, 10, 10);
    // stroke(0);
    // strokeWeight(2);
    pop();
}

function draw() {
    mouseUpdate();

    background(242);

    // let w = 40 * ceil(containerWidth / 40);
    // let h = 40 * ceil(containerHeight / 40);
    translate(width / 2, height / 2);
    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom);

    grid();

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
    document.getElementById('fps-counter').innerText = fps.toFixed(2);
}

function mouseWheel(e) {
    Controls.zoom(controls).worldZoom(e);
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
    released = false;

    if (controlMode == 'edit') {
        let pressedOnObject = objectsPress();
        if (pressedObject.id != 0) selectedObject = pressedObject;
        if (pressedOnObject) {
            document.getElementById('selecting').innerText = selectedObject.name;
            document.getElementById('input-value').style.display = (selectedObject.name == 'Input') ? 'block' : 'none';
        } else {
            if (mouseButton == CENTER)
                Controls.move(controls).pressed(e);
        }
    }
    if (controlMode == 'pan' || mouseButton == CENTER) {
        Controls.move(controls).pressed(e);
    }
}

function touchMoved(e) {
    if (controlMode == 'edit') {
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
        if (pressedObject.id != 0) selectedObject = pressedObject;
    }
    if (controlMode == 'pan' || mouseButton == CENTER) {
        Controls.move(controls).dragged(e);
    }
}

function touchEnded(e) {
    if (!released) {
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
                let wireNode = clickedNode.addWireNode();
                wireNode.inputs[0].connectByGrid();
            }
        }
        Controls.move(controls).released(e);
        // selected = false;
    }
    pressedObject = { id: 0 };
    released = true;
    // return false;
}

// new p5(sketch);