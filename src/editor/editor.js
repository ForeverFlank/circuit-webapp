import { EventHandler } from "../event/event-handler.js";
import * as Constants from "../constants.js"
import { CanvasContainer } from "../classes/canvas.js";
import { currentCircuit, mainCanvasContainer, mainContainer } from "../main.js";
import { updateSelectedCircuitObjectUI } from "../ui/selected-object.js";


class Editor {
    constructor() { }

    static mode = "edit";
    static wireDraggingEnabled = false;
    static divIds = ["top-tab", "gate-menu", "selecting-circuit-object-container", "control-tab"];
    static blurDiv = document.getElementById("background-blur");

    static container = null;
    static zoom = 1;
    static position = { x: 0, y: 0 }
    static pointerPosition = { x: 0, y: 0 };
    static centerPosition = { x: 0, y: 0 };
    static panEnabled = false;

    static pressedCircuitObject = { id: 0 };
    static pressedNode = null;
    static wireDrawingGraphics = null;

    static circuitPointerDown(e) {
        let isPressedOnCircuit = false;
        for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
            let mod = currentCircuit.modules[i];
            let nodes = mod.inputs.concat(mod.outputs); // TODO: remove concat for better performance
            for (let j = nodes.length - 1; j >= 0; j--) {
                if (nodes[j].pressed(e, false)) {
                    isPressedOnCircuit = true;
                    break;
                }
                let wires = nodes[j].connections;
                for (let k = wires.length - 1; k >= 0; k--) {
                    if (wires[k].pressed(e)) {
                        isPressedOnCircuit = true;
                        break;
                    }
                }
            }
            if (mod.pressed(e)) {
                isPressedOnCircuit = true;
                break;
            }
        }
        // updateSelectedCircuitObjectUI();
        return isPressedOnCircuit;
    }
    static circuitPointerMove(e) {
        for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
            let mod = currentCircuit.modules[i];
            let nodes = mod.inputs.concat(mod.outputs);
            mod.onPointerMove(e);
            for (let j = nodes.length - 1; j >= 0; j--) {
                // nodes[j].onPointerMove(e);
                let wires = nodes[j].connections;
                for (let k = wires.length - 1; k >= 0; k--) {
                    // wires[k].released(e)
                }
            }
        }
    }
    static circuitPointerUp(e) {
        let releasedOnNode = false;
        for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
            let mod = currentCircuit.modules[i];
            let nodes = mod.inputs.concat(mod.outputs);
            mod.released(e);
            for (let j = nodes.length - 1; j >= 0; j--) {
                releasedOnNode |= nodes[j].released(e, false)
                let wires = nodes[j].connections;
                for (let k = wires.length - 1; k >= 0; k--) {
                    // wires[k].released(e)
                }
            }
        }
        if (!releasedOnNode) {
            if (Editor.pressedNode) {
                console.log('asd')
                Editor.pressedNode.addWireNode();
            }
        }
        Editor.pressedCircuitObject = { id: 0 };
        Editor.pressedNode = null;
    }
    static isPointerHoveringOnDiv(e) {
        for (let i in this.divIds) {
            let div = document.getElementById(this.divIds[i]);
            let offsets = div.getBoundingClientRect();
            const top = offsets.top;
            const left = offsets.left;
            const height = div.clientHeight;
            const width = div.clientWidth;
            if (
                e.y > top &&
                e.y < top + height &&
                e.x > left &&
                e.x < left + width
            ) {
                return true;
            }
        }
        if (Editor.blurDiv.style.display != "none") return true;
        return false;
    }
    static updateViewport() {
        Editor.container.x = Editor.position.x;
        Editor.container.y = Editor.position.y;
        Editor.container.scale.x = Editor.zoom;
        Editor.container.scale.y = Editor.zoom;
    }
}
function editorPointerDown(e) {
    // console.log(e)
    // console.log(Editor.mode)
    if (Editor.mode == "edit") {
        if (Editor.isPointerHoveringOnDiv(e)) return;
        let isPressedOnCircuit = Editor.circuitPointerDown(e);
        if (!isPressedOnCircuit) {
            Editor.panEnabled = true;
        }
    } else if (Editor.mode == "pan") {

        Editor.panEnabled = true;
    } else if (Editor.mode == "delete") {

    }
}

EventHandler.add("pointerdown", editorPointerDown);
EventHandler.add("touchstart", editorPointerDown);

function editorPointerMove(e) {
    // console.log(e)

    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    Editor.pointerPosition.x = (EventHandler.pointerPosition.x - Editor.position.x) / Editor.zoom;
    Editor.pointerPosition.y = (EventHandler.pointerPosition.y - Editor.position.y) / Editor.zoom;
    Editor.centerPosition.x = (width / 2 - Editor.position.x) / Editor.zoom;
    Editor.centerPosition.y = (height / 2 - Editor.position.y) / Editor.zoom;
    /*
    placeX = -controls.view.x / controls.view.zoom;
    placeY = -controls.view.y / controls.view.zoom;
    placeX = Math.round(placeX / 20) * 20;
    placeY = Math.round(placeY / 20) * 20;
    */
    Editor.circuitPointerMove(e)
    if (Editor.panEnabled) {
        // console.log(EventHandler.deltaPointerPosition)
        Editor.position.x += EventHandler.deltaPointerPosition.x;
        Editor.position.y += EventHandler.deltaPointerPosition.y;
        Editor.updateViewport();
    }

    for (let i = currentCircuit.modules.length - 1; i >= 0; i--) {
        let mod = currentCircuit.modules[i];
        let nodes = mod.inputs.concat(mod.outputs);
        mod.hovering(e);
        for (let j = nodes.length - 1; j >= 0; j--) {
            nodes[j].hovering(e);
            let wires = nodes[j].connections;
            for (let k = wires.length - 1; k >= 0; k--) {
                // wires[k].released(e)
            }
        }
    }

}

EventHandler.add("pointermove", editorPointerMove);
// EventHandler.add("touchdrag", editorPointerMove);

EventHandler.add("pointerup",
    function editorPointerUp(e) {
        Editor.circuitPointerUp(e);
        Editor.panEnabled = false;
    }
);

EventHandler.add("wheel",
    function viewportPanZoom(e) {
        const zoomFactor = 0.1;
        const zoomDirection = e.deltaY < 0 ? 1 : -1;
        const zoom = zoomFactor * zoomDirection * Editor.zoom;
        const zoomAmount = 1 + zoom / Editor.zoom;
        const width = mainCanvasContainer.getContainerWidth();
        const height = mainCanvasContainer.getContainerHeight();
        let dx = e.x - Editor.position.x;
        let dy = e.y - Editor.position.y;
        dx *= zoomAmount;
        dy *= zoomAmount;
        Editor.zoom += zoom;
        if (Editor.zoom < 0.2) Editor.zoom = 0.2;
        else if (Editor.zoom > 5) Editor.zoom = 5;
        else {
            Editor.position.x = e.x - dx;
            Editor.position.y = e.y - dy;
        }
        Editor.updateViewport();
    }
);

export { Editor }