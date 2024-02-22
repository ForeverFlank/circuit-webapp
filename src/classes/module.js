// TODO
// multi bits wire
// graph search >=2 outputs with non high Z and throws error
// subcircuits
// rotation
// cleanup next googol years

class Module {
    constructor(name, width = 2, height = 2, x = placeX, y = placeY) {
        this.name = name;
        this.id = unique(name);
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
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
    }
    hovering() {
        if (controlMode == "pan") return false;
        if (hoveringOnDiv()) return false;
        let isHoveringNode = false;
        this.inputs.forEach((x) => {
            isHoveringNode ||= x.hovering();
        });
        this.outputs.forEach((x) => {
            isHoveringNode ||= x.hovering();
        });
        let hovering =
            mouseCanvasX > this.x + 5 &&
            mouseCanvasX < this.x + this.width * 20 - 5 &&
            mouseCanvasY > this.y + 5 &&
            mouseCanvasY < this.y + this.height * 20 - 5 &&
            !isHoveringNode;
        return hovering;
    }
    init() {}
    evaluate(time, checkDisconnectedInput = true, evaluated = new Set()) {
        function currentItemToString(index, nodeId) {
            return `i${index}n${nodeId}`;
        }
        this.inputs.concat(this.outputs).forEach((node) => {
            node.icto = [];
            if (!checkDisconnectedInput) return;
            let nodeValues = node.getValueAtTime(time);
            Object.entries(nodeValues).forEach((x) => {
                let index = x[0];
                let activeOutputs =
                    node.connectedToOutput(index, time).activeOutputs;

                if (activeOutputs.length == 0) {
                    index = x[0];
                    let stack = [];
                    let traversed = new Set();
                    stack.push([index, node]);
                    while (stack.length > 0) {
                        let [index, currentNode] = stack.pop();
                        // console.log('setZ', currentNode.id)
                        index = parseInt(index);
                        currentNode.setValueAtIndexAtTime(time, index, State.highZ);
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
                    activeOutputs[0].setValues(activeOutputs[0].getValueAtTime(time), time)
                }
            });
        });
    }
    remove() {
        currentCircuit.removeModule(this);
    }
    render(
        label = this.displayName,
        labelSize = 12,
        labelOffsetX = 0,
        labelOffsetY = 0,
        src,
        imageOffsetX = 0,
        imageOffsetY = 0,
        imageWidth = this.width * 20,
        imageHeight = this.height * 20
    ) {
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
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(labelSize);
        text(
            label,
            (this.width * 20) / 2 + this.x + labelOffsetX,
            (this.height * 20) / 2 + this.y + labelOffsetY - textSize() * 0.2
        );

        if (selectedObject.id == this.id) {
            push();

            pop();
        }

        if (DEBUG) {
            push();
            // text(this.id.slice(0, 10), this.x, this.y + 40);
            // text(this.name, this.x + this.width * 10, this.y + 52);
            pop();
        }
        pop();
    }
    pressed() {
        this.isHovering = this.hovering();
        if (this.isHovering && pressedObject.id == 0) {
            if (mouseButton == LEFT) {
                pressedObject = this;
                // this.selected();
                this.mouseDown = true && !this.isDragging;
                this.isDragging = true;
                if (this.mouseDown) {
                    this.rawX = this.x;
                    this.rawY = this.y;
                }
                this.offsetX = this.rawX - mouseCanvasX;
                this.offsetY = this.rawY - mouseCanvasY;
                return this;
            }
            if (mouseButton == RIGHT) {
                this.remove();
            }
        }
        if (this.isDragging) {
            this.rawX = mouseCanvasX + this.offsetX;
            this.rawY = mouseCanvasY + this.offsetY;
            this.x = round(this.rawX / 20) * 20;
            this.y = round(this.rawY / 20) * 20;
        }
        return false;
    }
    selected() {}
    released() {
        this.isDragging = false;
        this.isHovering = false;
        this.inputs.concat(this.outputs).forEach((x) => {
            x.connectByGrid();
        });
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
}

class WireNode extends Module {
    constructor(name, x, y, value = [State.highZ]) {
        super(name, 0, 0, x, y);
        this.inputs = [new ModuleNode(this, "Node", 0, 0, value)];
    }
    hovering() {
        return this.inputs[0].hovering();
    }
    evaluate(time, connectedToOutput = false, evaluated = new Set()) {
        super.evaluate(time, connectedToOutput, evaluated);
    }
    pressed() {
        if (this.hovering() && pressedObject.id == 0) {
            pressedObject = this;
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
        let mod = new WireNode("Node", x, y, value);
        currentCircuit.addModule(mod, evaluate);
        return mod;
    }
}

class Input extends Module {
    constructor(name) {
        super(name, 2, 2);
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
    render() {
        let char = State.char(this.outputValue);
        super.render(char, 12, 0, 0, "basic/input");
    }
    selected() {
        super.selected();
        let value = this.outputValue;

        document.getElementById("selecting-input").style.display = "flex";
        setInputButtonColor(value);
    }
    static add() {
        let mod = new Input("Input");
        currentCircuit.addInputModule(mod);
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
        value == State.highZ ? "#71717a" : "white";
    element("0").style.backgroundColor =
        value == State.low ? "#ef4444" : "white";
    element("1").style.backgroundColor =
        value == State.high ? "#22c55e" : "white";
    element("z").style.color = value == State.highZ ? "white" : "black";
    element("0").style.color = value == State.low ? "white" : "black";
    element("1").style.color = value == State.high ? "white" : "black";
}

class Output extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputValue = [State.highZ];
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        super.render(char, 12, 0, 0, "basic/output");
    }
    static add() {
        let mod = new Output("Output");
        currentCircuit.addOutputModule(mod);
    }
}
