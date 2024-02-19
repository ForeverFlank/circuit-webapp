p5.disableFriendlyErrors = true;

var canvas;
function setup() {
    canvas = createCanvas(containerWidth, containerHeight);
    canvas.parent("canvas-container");
    textFont(fontRegular);
}

function windowResized() {
    containerWidth = getContainerWidth();
    containerHeight = getContainerHeight();
    resizeCanvas(containerWidth, containerHeight);
}

function grid() {
    let view = controls.view;
    let width = containerWidth;
    let height = containerHeight;
    let roundedWidth = 40 * ceil(width / 40);
    let roundedHeight = 40 * ceil(height / 40);
    let zoom = view.zoom;
    push();
    noStroke();

    stroke("#e4e4e7");
    strokeWeight(1);
    let startX = floor((-view.x - roundedWidth / 2) / 20 / zoom) * 20;
    let startY = floor((-view.y - roundedHeight / 2) / 20 / zoom) * 20;
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

function timingDiagram(xPos, yPos) {
    let nodes = currentCircuit.getNodes();
    xPos = 220;
    yPos = 500 - nodes.length * 15;
    push();
    fill(0);
    rect(xPos, yPos, 400, 30 + nodes.length * 15);

    fill(255);
    for (let i = 0; i <= 10; i += 1) {
        text(i, 50 + xPos + 20 * i, yPos + 30 + nodes.length * 15);
    }

    let i = 1;
    nodes.forEach((x) => {
        fill(255);
        noStroke();
        text(x.name, xPos + 5, yPos + 15 * i++);
        noFill();
        stroke(255);
        strokeWeight(1);
        line(xPos + 45, yPos + 15 * i - 20, xPos + 45, yPos + 15 * i - 25);

        for (let t = 0; t <= 10; t += 0.2) {
            // console.log(x.getValue(t))
            let value = x.getValue(t);
            let color = value == null ? 255 : State.color(value);
            stroke(color);
            value = value >= 0 ? value : 0;
            beginShape();
            vertex(xPos + t * 20 + 50, yPos + 15 * i + value * -5 - 20);
            vertex(xPos + t * 20 + 54, yPos + 15 * i + value * -5 - 20);
            endShape();
        }
    });
    pop();
}

function nodeHint() {
    push();
    let x = hoveringNode.relativeX * 20 + hoveringNode.owner.x;
    let y = hoveringNode.relativeY * 20 + hoveringNode.owner.y;
    let margin = 3;
    textAlign(CENTER, CENTER);
    let bbox = fontRegular.textBounds(hoveringNode.name, x, y - 16);
    fill(240);
    rect(
        bbox.x - margin,
        bbox.y - margin,
        bbox.w + margin * 2,
        bbox.h + margin * 2
    );
    fill(0);
    text(hoveringNode.name, x, y - 16);
    pop();
}

function draw() {
    mouseUpdate();
    placeX = -Math.round(controls.view.x / 20 / controls.view.zoom) * 20;
    placeY = -Math.round(controls.view.y / 20 / controls.view.zoom) * 20;
    hoveringNode = {};

    mainRender();

    // timingDiagram();

    let fps = frameRate();
    document.getElementById("fps-counter").innerText = fps.toFixed(2);
}

function removePressedObject() {
    selectedObject.remove();
    selectedObjectUI();
}

function mouseWheel(e) {
    if (!hoveringOnDiv()) {
        Controls.zoom(controls).worldZoom(e);
    }
}

function objectsPress() {
    mouseUpdate();
    let pressedOnObject = false;
    for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
        let mod = currentCircuit.modules[i];
        let nodes = mod.inputs.concat(mod.outputs);
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
        if (mod.pressed()) {
            pressedOnObject = true;
            break;
        }
    }
    return pressedOnObject;
}

var released = false;
function touchStarted(e) {
    if (hoveringOnDiv(e)) return;
    released = false;
    if (controlMode == "edit") {
        let pressedOnObject = objectsPress();
        if (pressedObject.id != 0) {
            selectedObject = pressedObject;
        }
        if (!pressedOnObject) {
            if (mouseButton == LEFT) {
                selectedObject = { id: 0 };
            }
            if (mouseButton == CENTER) {
                Controls.move(controls).pressed(e);
            }
        }
        selectedObjectUI();
    }
    if (controlMode == "pan" || mouseButton == LEFT) {
        Controls.move(controls).pressed(e);
    }
}

function touchMoved(e) {
    if (hoveringOnDiv(e)) return;
    if (controlMode == "edit") {
        let pressedOnObject = false;
        for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
            let mod = currentCircuit.modules[i];
            let nodes = mod.inputs.concat(mod.outputs);
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
            if (mod.pressed()) {
                pressedOnObject = true;
                break;
            }
        }
        if (pressedObject.id != 0) selectedObject = pressedObject;
    }
    if (controlMode == "pan" || mouseButton == CENTER) {
        Controls.move(controls).dragged(e);
    }
}

function touchEnded(e) {
    if (!released) {
        let releasedOnObject = false;
        currentCircuit.modules.forEach((x) => {
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
    // console.log(circuit)
}

// new p5(sketch);