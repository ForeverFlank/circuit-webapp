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
        this.displayName = '';
        this.inputs = [];
        this.outputs = [];
        this.linkedNode = null;
        this.isSubModule = false;
        this.isDragging = false;
        this.mouseDown = false;
        this.isHovering = false;
        this.rawX = null; this.rawY = null;
        this.offsetX = null; this.offsetY = null;
    }
    hovering() {
        if (hoveringOnDiv()) return false;
        let hoveringNode = false;
        this.inputs.forEach((x) => { hoveringNode ||= x.hovering() });
        this.outputs.forEach((x) => { hoveringNode ||= x.hovering() });
        let hovering = mouseCanvasX > this.x &&
            mouseCanvasX < this.x + this.width * 20 &&
            mouseCanvasY > this.y &&
            mouseCanvasY < this.y + this.height * 20 &&
            !hoveringNode;
        return hovering;
    }
    evaluate(time, checkDisconnectedInput = true, evaluated = new Set()) {
        // console.log('called from', this.id, checkDisconnectedInput);
        // DFS
        if (checkDisconnectedInput) {
            this.inputs.concat(this.outputs).forEach(x => {
                let stack = [];
                let traversed = new Set();
                let marked = new Set();
                stack.push(x);
                let isConnectedToOutput = x.nodeType == 'output';
                let outputsCount = 0;
                while (stack.length > 0) {
                    let src = stack.pop();
                    if (!traversed.has(src.id)) {
                        traversed.add(src.id);
                        src.connections.forEach((wire) => {
                            let dest = wire.destination;
                            stack.push(dest);
                            if (dest.nodeType == 'output') {
                                isConnectedToOutput ||= true;
                                if (!dest.isHighZ &&
                                    !marked.has(dest.id)) {
                                    outputsCount++;
                                    marked.add(dest.id);
                                }
                            }
                        });
                    }
                }
                if (!isConnectedToOutput) {
                    x.value = State.highZ;
                    x.isHighZ = true;
                    x.connections.forEach((y) => {
                        y.destination.value = State.highZ;
                        if (!evaluated.has(this.id)) {
                            y.destination.owner.evaluate(time, false, evaluated.add(this.id));
                        }
                    });
                } else {
                    if (outputsCount >= 2) {
                        this.isDragging = false;
                        this.isHovering = false;
                        // throw new Error('Shortage');
                    }
                }
            });
        }
        this.outputs.forEach((x) => {
            if (x.isHighZ) return;
            let stack = [];
            let traversed = new Set();
            let marked = new Set();
            stack.push(x);
            while (stack.length > 0) {
                let src = stack.pop();
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    marked.add(src.id);
                    src.connections.forEach((wire) => {
                        let dest = wire.destination;
                        stack.push(dest);
                        if (!marked.has(dest.id)) {
                            wire.setDirection(src, dest);
                        }
                        if (this.inputs.some(x => x.id == dest.id)) {
                            this.isDragging = false;
                            this.isHovering = false;
                            throw new Error('Circular Loop!');
                        }
                        marked.add(dest.id);
                    });
                }
            }
        });

    }
    remove() {
        circuit.removeModule(this);
    }
    render(label = this.displayName, labelSize = 12, labelOffsetX = 0, labelOffsetY = 0, src) {
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
            image(sprites[src], this.x, this.y, 60, 40)
        } else {
            stroke(0);
            strokeWeight(2);
            rect(this.x, this.y, this.width * 20, this.height * 20);
        }
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(labelSize)
        text(label,
            this.width * 20 / 2 + this.x + labelOffsetX,
            this.height * 20 / 2 + this.y + labelOffsetY);
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
            this.inputs.concat(this.outputs.forEach(x => x.updateGridNodeLookup()));
        }
        return false;
    }
    released() {
        this.isDragging = false;
        this.isHovering = false;
        this.inputs.concat(this.outputs).forEach(x => {
            x.connectByGrid();
        });
    }
}

class WireNode extends Module {
    constructor(name, x, y) {
        super(name, 0, 0, x, y);
        this.inputs = [new ModuleNode(this, 'node', 0, 0, State.highZ)];
    }
    hovering() {
        return this.inputs[0].hovering();
    }
    evaluate(connectedToOutput = false, evaluated = new Set()) {
        this.inputs.forEach((x) => {
            let stack = [];
            let traversed = new Set();
            stack.push(x);
            while (stack.length > 0) {
                let src = stack.pop();
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    src.connections.forEach((wire) => {
                        let dest = wire.destination;
                        stack.push(dest);
                        if (dest.nodeType == 'output') {
                            connectedToOutput ||= true;
                        }
                    });
                    if (connectedToOutput) {
                        break;
                    }
                }
            }
            if (!connectedToOutput) {
                this.inputs.forEach((x) => {
                    let stack2 = [];
                    let traversed2 = new Set();
                    stack2.push(x);
                    while (stack2.length > 0) {
                        let src = stack2.pop();
                        if (!traversed2.has(src.id)) {
                            traversed2.add(src.id);
                            src.connections.forEach((wire) => {
                                let dest = wire.destination;
                                stack2.push(dest);
                                dest.value = State.highZ;
                            });
                        }
                    }
                });
            }
        });
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
        super.render();
    }
    static add(x, y) {
        let module = new WireNode('', x, y);
        circuit.addModule(module);
        return module;
    }
}

class Input extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.outputValue = State.low;
        this.outputs = [new OutputNode(this, 'out1', 3, 1, State.low, 0)];
        this.isSubmoduleIO = false;
    }
    setInput(value, time = 0) {
        this.outputValue = value;
        this.outputs[0].setValue(this.outputValue, time, true, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        let char = State.char(this.outputValue);
        super.render(char, 12, -10, 0, 'input');
    }
    released() {
        super.released();
    }
    static add() {
        let module = new Input('Input');
        circuit.addInputModule(module);
    }
}

function setInput(time) {
    let value = document.getElementById('input-value').value;
    selectedObject.setInput(State.fromNumber(value), time);
    circuit.evaluateAll(false);
}

class Output extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputValue = State.highZ;
        this.inputs = [new InputNode(this, 'in1', 0, 1, State.highZ)];
    }
    evaluate(time) {
        super.evaluate(time);
        if (this.linkedNode != null) {
            this.linkedNode.setValue(this.inputValue);
        }
    }
    render() {
        let char;
        let value = this.inputs[0].value;
        if (value == State.low) {
            char = '0';
        } else if (value == State.high) {
            char = '1';
        } else if (value == State.highZ) {
            char = 'Z';
        } else {
            char = 'X';
        }
        super.render(char);
    }
    static add() {
        let module = new Output('Output');
        circuit.addOutputModule(module);
    }
}

