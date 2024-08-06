import { Editor } from "../editor/editor.js";
import { State } from "./state.js";
import { unique } from "../custom-uuid.js";
import { ModuleNode, InputNode, OutputNode } from "./modulenode.js";
import { EventHandler } from "../event/event-handler.js";
import { currentCircuit, mainContainer } from "../main.js";
import * as Constants from "../constants.js";

// Drag to move by Daniel Shiffman <http://www.shiffman.net>
// https://editor.p5js.org/icm/sketches/BkRHbimhm

// TODO
// subcircuits
// cleanup next googol years

class Module {
    constructor(
        obj = {
            name: '',
            width: 2,
            height: 2
        }
    ) {
        for (let key in obj) {
            this[key] = obj[key];
        }
        // console.log(obj)
        if (obj.x == undefined) obj.x = Editor.centerPosition.x;
        if (obj.y == undefined) obj.y = Editor.centerPosition.y;
        // console.log(Editor.position.x)
        this.name = obj.name;
        this.id = unique(obj.name);
        this.width = obj.width;
        this.height = obj.height;
        this.x = obj.x;
        this.y = obj.y;
        this.displayName = "";
        this.inputs = [];
        this.outputs = [];
        this.linkedNode = null;
        this.isSubModule = false;
        this.isDragging = false;
        this.mouseDown = false;
        this.isHovering = false;
        this.rawX = null;
        this.rawY = null;
        this.offsetX = null;
        this.offsetY = null;
        this.objectType = "module";
        this.ignoreDiv = false;
        this.isHiddenOnAdd = false;
        console.log(this)
    }
    hovering(e) {
        if (Editor.mode == "pan") return false;
        if (Editor.isPointerHoveringOnDiv(e) && !this.ignoreDiv) return false;
        let isHoveringNode = false;
        this.inputs.forEach((x) => {
            isHoveringNode ||= x.hovering(e);
        });
        this.outputs.forEach((x) => {
            isHoveringNode ||= x.hovering(e);
        });
        /*
        let hovering =
        Editor.pointerPosition.x > this.x + 5 &&
        Editor.pointerPosition.x < this.x + this.width * 20 - 5 &&
        Editor.pointerPosition.y > this.y + 5 &&
        Editor.pointerPosition.y < this.y + this.height * 20 - 5 &&
        !isHoveringNode;
        */
        let hovering =
            Editor.pointerPosition.x > this.x &&
            Editor.pointerPosition.x < this.x + this.width * 20 &&
            Editor.pointerPosition.y > this.y &&
            Editor.pointerPosition.y < this.y + this.height * 20 &&
            !isHoveringNode;
        // console.log('x', this.x, Editor.pointerPosition.x, this.x + this.width * 20);
        // console.log('y', this.y, Editor.pointerPosition.y, this.y + this.height * 20);
        this.isHovering = hovering;
        return hovering;
    }
    init() { }
    evaluate(time, checkDisconnectedInput = true, evaluated = new Set()) {
        function currentItemToString(index, nodeId) {
            return `i${index}n${nodeId}`;
        }
        this.inputs.concat(this.outputs).forEach((node) => {
            if (!checkDisconnectedInput) return;
            let nodeValues = node.getValueAtTime(time);
            Object.entries(nodeValues).forEach((x) => {
                let index = x[0];
                let activeOutputs = node.connectedToOutput(
                    index,
                    time
                ).activeOutputs;

                if (activeOutputs.length == 0) {
                    index = x[0];
                    let stack = [];
                    let traversed = new Set();
                    stack.push([index, node]);
                    while (stack.length > 0) {
                        let [index, currentNode] = stack.pop();
                        // console.log('setZ', currentNode.id)
                        index = parseInt(index);
                        currentNode.setValueAtIndexAtTime(
                            time,
                            index,
                            State.highZ
                        );
                        currentNode.setHighZAtIndexAtTime(time, index, true);
                        if (
                            traversed.has(
                                currentItemToString(index, currentNode.id)
                            )
                        ) {
                            continue;
                        }
                        traversed.add(
                            currentItemToString(index, currentNode.id)
                        );
                        currentNode.connections.forEach((wire) => {
                            let destinationNode = wire.destination;
                            if (wire.isSplitterConnection()) {
                                let newIndex = destinationNode.indices.indexOf(
                                    index + Math.min(...currentNode.indices)
                                );
                                if (newIndex != -1) {
                                    stack.push([newIndex, destinationNode]);
                                }
                                return;
                            }
                            stack.push([index, destinationNode]);
                        });
                    }
                } else if (activeOutputs.length >= 2) {
                    let allSameElements = activeOutputs.every(
                        (value, i, arr) => value === arr[0]
                    );
                    // console.log(allSameElements);
                    if (!allSameElements) {
                        // this.isDragging = false;
                        // this.isHovering = false;
                        // throw new Error("Shortage");
                    }
                }
                if (activeOutputs.length >= 1) {
                    activeOutputs[0].setValues(
                        activeOutputs[0].getValueAtTime(time),
                        time
                    );
                }
            });
        });
    }
    remove() {
        currentCircuit.removeModule(this);
    }
    render(
        obj = {
            container: undefined,
            graphics: undefined,
            labels: [[this.displayName, 12, 0, 0]],
            src: undefined,
            imageOffsetX: 0,
            imageOffsetY: 0,
            imageWidth: this.width * 20,
            imageHeight: this.height * 20
        }
    ) {
        if (this.sprite == null) {
            this.container = obj.container;
            this.sprite = PIXI.Sprite.from('sprites/' + obj.src + '.png');
            mainContainer.addChild(this.sprite)
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.scale.x = Constants.TEXTURE_RESCALE;
            this.sprite.scale.y = Constants.TEXTURE_RESCALE;
            console.log(this.x, this.y)
            const colorMatrix = new PIXI.ColorMatrixFilter();
            this.sprite.filters = [colorMatrix];
        }
        if (this.isDragging) {
            this.sprite.filters[0].brightness(0.6);
        } else if (this.isHovering) {
            this.sprite.filters[0].brightness(0.8);
        } else {
            this.sprite.filters[0].brightness(1);
        }
        /*
        if (this.isHiddenOnAdd) return;
        // let hovering = this.isHovering();
        push();
        if (this.isDragging) {
            fill(160);
            tint(160);
        } else if (this.hovering()) {
            fill(220);
            tint(220);
        } else {
            fill(255);
            tint(255);
        }
        if (src != null) {
            image(
                sprites[src],
                this.x + imageOffsetX,
                this.y + imageOffsetY,
                imageWidth,
                imageHeight
            );
        } else {
            stroke(0);
            strokeWeight(2);
            rect(
                this.x + 10,
                this.y + 10,
                this.width * 20 - 20,
                this.height * 20 - 20
            );
        }
        pop();

        push();
        noStroke();
        fill(0);
        labels.forEach((item) => {
            let label = item[0];
            let labelSize = item[1];
            let labelOffsetX = item[2];
            let labelOffsetY = item[3];
            let align = item[4] == null ? CENTER : item[4];

            textAlign(align, CENTER);
            textSize(labelSize);
            text(
                label,
                (this.width * 20) / 2 + this.x + labelOffsetX,
                (this.height * 20) / 2 +
                    this.y +
                    labelOffsetY -
                    textSize() * 0.2
            );
        });
        pop();

        if (DEBUG) {
            push();
            // text(this.id.slice(0, 10), this.x, this.y + 40);
            // text(this.name, this.x + this.width * 10, this.y + 52);
            pop();
        }
            */
    }
    pressed(e, override = false) {
        this.isHovering = this.hovering(e) || override;
        // console.log(this.isHovering)
        if (!Editor.isPointerHoveringOnDiv(e) &&
            !(
                EventHandler.pointerPosition.x ==
                EventHandler.previousPointerPosition.x &&
                EventHandler.pointerPosition.y ==
                EventHandler.previousPointerPosition.y)) {
            this.isHiddenOnAdd = false;
        }
        if (this.isHovering && Editor.pressedCircuitObject.id == 0) {
            // console.log(e.button)
            if (e.button == 0) {
                Editor.pressedCircuitObject = this;
                // this.selected();
                this.mouseDown = true && !this.isDragging;
                this.isDragging = true;
                if (this.mouseDown) {
                    this.rawX = this.x;
                    this.rawY = this.y;
                }
                this.offsetX = this.rawX - Editor.pointerPosition.x;
                this.offsetY = this.rawY - Editor.pointerPosition.y;
                return this;
            }
            if (e.button == 2) {
                this.remove();
            }
        }
        /*
        if (this.isDragging) {
            this.rawX = Editor.pointerPosition.x + this.offsetX;
            this.rawY = Editor.pointerPosition.y + this.offsetY;
            this.x = Math.round(this.rawX / 20) * 20;
            this.y = Math.round(this.rawY / 20) * 20;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
        */
        return false;
    }
    onPointerMove(e) {
        if (this.isDragging) {
            this.rawX = Editor.pointerPosition.x + this.offsetX;
            this.rawY = Editor.pointerPosition.y + this.offsetY;
            this.x = Math.round(this.rawX / 20) * 20;
            this.y = Math.round(this.rawY / 20) * 20;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            let inputs = this.inputs;
            let outputs = this.outputs;
            let container = this.container;
            function renderWire(node) {
                let wires = node.connections;
                for (let k = wires.length - 1; k >= 0; --k) {
                    wires[k].render({
                        container: container,
                        rerender: true
                    });
                    wires[k].parallelWire.render({
                        container: container,
                        rerender: true
                    });
                }
            }
    
            for (let j = inputs.length - 1; j >= 0; --j) {
                let node = inputs[j];
                renderWire(node);
            }
            for (let j = outputs.length - 1; j >= 0; --j) {
                let node = outputs[j];
                renderWire(node);
            }
        }
    }
    selected() { }
    released(e) {
        this.isHiddenOnAdd = false;
        if (this.ignoreDiv && Editor.isPointerHoveringOnDiv(e)) {
            this.x = round(cameraCenterX / 20) * 20;
            this.y = round(cameraCenterY / 20) * 20;
        }
        this.isDragging = false;
        this.isHovering = false;
        this.inputs.concat(this.outputs).forEach((x) => {
            x.connectByGrid();
        });
        this.ignoreDiv = false;
    }
    isInputModule() {
        return ["Input", "N-bit Input"].includes(this.name);
    }
    isOutputModule() {
        return ["Output"].includes(this.name);
    }
    serialize() {
        return {
            name: this.name,
            id: this.id,
            objectType: this.objectType,
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
            displayName: this.displayName,
            inputsId: this.inputs.map((node) => node.id),
            outputsId: this.outputs.map((node) => node.id),
            isSubModule: this.isSubModule,
        };
    }
    fromSerialized(data, inputs, outputs) {
        this.name = data.name;
        this.id = data.id;
        this.objectType = data.objectType;
        this.width = data.width;
        this.height = data.height;
        this.x = data.x;
        this.y = data.y;
        this.displayName = data.displayName;
        this.isSubModule = data.isSubModule;
        this.inputsId = data.inputsId;
        this.outputsId = data.outputsId;
        // this.inputs = inputs;
        // this.outputs = outputs;
    }
    static addToCircuit(mod) {
        //// mouseUpdate();
        currentCircuit.addInputModule(mod);
        // mod.ignoreDiv = true;
        // mod.isHiddenOnAdd = true;
        // mod.pressed(true);
    }
}

class WireNode extends Module {
    constructor(obj) {
        super(obj);
        this.inputs = [new ModuleNode(this, "Node", 0, 0, obj.value)];
    }
    hovering(e) {
        return this.inputs[0].hovering(e);
    }
    evaluate(time, connectedToOutput = false, evaluated = new Set()) {
        super.evaluate(time, connectedToOutput, evaluated);
    }
    pressed(e) {
        if (this.hovering(e) && Editor.pressedCircuitObject.id == 0) {
            Editor.pressedCircuitObject = this;
            if (mouseButton == LEFT) {
                return this;
            }
            if (mouseButton == RIGHT) {
                this.remove();
            }
        }
        return false;
    }
    render() {
        return;
    }
    static add(x, y, value, evaluate) {
        console.log('we')
        let mod = new WireNode({
            name: "Node", 
            x: x, 
            y: y, 
            value: value
        });
        currentCircuit.addModule(mod, evaluate);
        return mod;
    }
}

class Input extends Module {
    constructor(obj) {
        obj.width = 2;
        obj.height = 2;
        super(obj);
        this.outputValue = [State.low];
        this.outputs = [new OutputNode(this, "Output", 2, 1, [State.low], 0)];
        this.isSubmoduleIO = false;
    }
    setInput(value, time = 0) {
        this.outputValue = value;
        this.outputs[0].setValues(this.outputValue, time, true, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(obj = {
        container: undefined,
        graphics: undefined,
    }) {
        let char = State.char(this.outputValue);
        obj.labels = [[char, 12, 0, 0]];
        obj.src = "basic/input";
        super.render(obj);
    }
    selected() {
        super.selected();
        let value = this.outputValue;

        document.getElementById("selecting-input").style.display = "flex";
        setInputButtonColor(value);
    }
    static add() {
        Module.addToCircuit(new Input({ name: "Input" }));
    }
}

function setInput(time, value) {
    value = State.fromNumber(value);
    selectedObject.setInput([value], time);
    setInputButtonColor(value);
    currentCircuit.evaluateAll(false);
}

function setInputButtonColor(value) {
    function element(s) {
        return document.getElementById(`selecting-input-${s}`);
    }
    element("z").style.backgroundColor =
        value == State.highZ ? "#71717a" : "#f4f4f5";
    element("0").style.backgroundColor =
        value == State.low ? "#ef4444" : "#f4f4f5";
    element("1").style.backgroundColor =
        value == State.high ? "#22c55e" : "#f4f4f5";
    element("z").style.color = value == State.highZ ? "white" : "black";
    element("0").style.color = value == State.low ? "white" : "black";
    element("1").style.color = value == State.high ? "white" : "black";
}

class Output extends Module {
    constructor(obj) {
        obj.width = 2;
        obj.height = 2;
        super(obj);
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(obj = {
        container: undefined,
        graphics: undefined,
    }) {
        let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        obj.labels = [[char, 12, 0, 0]];
        obj.src = "basic/output";
        super.render(obj);
    }
    static add() {
        Module.addToCircuit(new Output({ name: "Output" }));
    }
}

export { Module, WireNode, Input, Output }