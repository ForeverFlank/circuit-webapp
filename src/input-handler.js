function objectsPress(disableWireDragging = false) {
    mouseUpdate();
    let pressedOnObject = false;
    for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
        let mod = currentCircuit.modules[i];
        let nodes = mod.inputs.concat(mod.outputs);
        for (let j = nodes.length - 1; j >= 0; j--) {
            if (nodes[j].pressed(disableWireDragging)) {
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

function mousePressed(e) {
    touchStarted(e);
}
function mouseDragged(e) {
    touchMoved(e);
}
function mouseReleased(e) {
    touchEnded(e);
}

var released = false;
var initialPinchDistance;
let initialZoom;
function touchStarted(e) {
    mouseUpdate();
    released = false;
    if (hoveringOnDiv(e)) return;
    if (touches.length >= 2) {
        const distance = (u, v) => sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
        initialPinchDistance = distance(touches[0], touches[1]);
        initialZoom = controls.view.zoom;
        console.log(initialPinchDistance);
    }
    if (controlMode == "edit") {
        let pressedOnObject = objectsPress();
        if (pressedObject.id != 0) {
            selectedObject = pressedObject;
        } else if (pressedWire.id != 0) {
            selectedObject = pressedWire;
        } else {
            Controls.move(controls).pressed(e);
        }
        if (!pressedOnObject) {
            if (mouseButton == LEFT) {
                selectedObject = { id: 0 };
            }
            // Controls.move(controls).pressed(e);
        }
        selectedObjectUI();
    }
    
    if (controlMode == "pan" && mouseButton == LEFT) {
        Controls.move(controls).pressed(e);
    }
    if (controlMode == "delete" && mouseButton == LEFT) {
        objectsPress(true);
        // console.log(pressedWire.source.owner.name, pressedWire.destination.owner.name)
        if (pressedObject.id != 0) {
            pressedObject.remove();
            pressedObject = { id: 0 };
        }
        if (pressedWire.id != 0) {
            pressedWire.remove();
            pressedWire = { id: 0 };
        }
    }
}

function touchMoved(e) {
    mouseUpdate();
    // if (hoveringOnDiv(e)) return;
    if (touches.length >= 2) {
        const distance = (u, v) => sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
        let currentPinchDistance = distance(touches[0], touches[1]);
        Controls.setZoom(
            (initialZoom * currentPinchDistance) / initialPinchDistance
        );
    }
    if (controlMode == "edit") {
        objectsPress();
        // console.log(mouseButton)
        if (pressedObject.id != 0) {
            selectedObject = pressedObject;
        } else {
            if (pressedWire.id != 0) {
                selectedObject = pressedWire;
            }
            else if (mouseButton == LEFT || mouseButton == 0) {
                Controls.move(controls).dragged(e);
            }
        }
    }
    if (controlMode == "pan" && mouseButton == LEFT) {
        Controls.move(controls).dragged(e);
    }
    if (controlMode == "delete" && mouseButton == LEFT) {
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
    pressedWire = { id: 0 };
    released = true;
    // return false;
    // console.log(circuit)
}

function removeSelectedObject() {
    selectedObject.remove();
    selectedObject = { id: 0 };
    selectedObjectUI();
}

function mouseWheel(e) {
    if (!hoveringOnDiv()) {
        Controls.zoom(controls).worldZoom(e);
    }
}