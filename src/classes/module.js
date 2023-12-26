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
        this.isSubModule = false;
        this.isDragging = false;
        this.mouseDown = false;
        this.isHovering = false;
        this.rawX = null; this.rawY = null;
        this.offsetX = null; this.offsetY = null;
    }
    hovering() {
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
                // console.log('eval', isConnectedToOutput, outputsCount)
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
                        throw new Error('Shortage');
                    }
                }
            });
        }
        // console.log('called from', this.id);
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
    render(name = this.displayName) {
        // let hovering = this.isHovering();
        if (this.isDragging) {
            fill(160);
        } else if (this.hovering()) {
            fill(220);
        } else {
            fill(255);
        }
        stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.width * 20, this.height * 20);
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        text(name, this.width * 20 / 2 + this.x, this.height * 20 / 2 + this.y);
        if (DEBUG) {
            push();
            // text(this.id.slice(0, 10), this.x, this.y + 40);
            // text(this.name, this.x + this.width * 10, this.y + 52);
            pop();
        }
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
        super(name, 2, 2);
        this.outputValue = State.low;
        this.outputs = [new OutputNode(this, 'out1', 2, 1, State.low, 0)];
    }
    setInput(value, time = 0) {
        this.outputValue = value;
        this.outputs[0].setValue(this.outputValue, time, true, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        let char;
        if (this.outputValue == State.low) {
            char = '0';
        } else if (this.outputValue == State.high) {
            char = '1';
        } else if (this.outputValue == State.highZ) {
            char = 'Z';
        } else {
            char = 'X';
        }
        super.render(char);
    }
    released() {
        super.released();
    }
    static add() {
        let module = new Input('Input');
        circuit.addInputModule(module);
    }
}

function setInput() {
    let value = document.getElementById('input-value').value;
    // console.log(selectedObject)
    selectedObject.setInput(State.fromNumber(value));
    circuit.evaluateAll(false);
}

class Output extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1, State.highZ)];
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

class Circuit extends Module {
    constructor(name) {
        super(name);
        this.modules = [];
        this.inputModules = [];
        this.outputModules = [];
    }
    getModules() {
        return this.modules;
    }
    getNodes() {
        let nodes = [];
        this.modules.forEach(x =>
            nodes = nodes.concat(x.inputs.concat(x.outputs)));
        return nodes;
    }
    addModule(module, evaluate = true) {
        this.modules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    addInputModule(module, evaluate = true) {
        this.modules.push(module);
        this.inputModules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    addOutputModule(module, evaluate = true) {
        this.modules.push(module);
        this.outputModules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    removeModule(module, evaluate = true) {
        module.inputs.concat(module.outputs).forEach(x => x.disconnectAll());
        this.modules = this.modules.filter(x => x.id != module.id);
        if (evaluate) {
            this.evaluateAll();
        }
    }
    evaluateAll(reset = true) {
        this.getNodes().forEach(node => node.totalDelay = []);
        let startingNodes = [];
        this.modules.forEach(m => {
            if (m.name == 'Input') {
                m.setInput(m.outputValue);
                startingNodes.push(m.outputs[0]);
            } else {
                m.inputs.forEach(x => {
                    if (x.connectedToOutput().isConnectedToOutput) {
                    } else {
                        startingNodes.push(x);
                    }
                    if (x.nodeType == 'node' || reset) {
                        x.isHighZ = true;
                        x.value = State.highZ;
                        x.valueAtTime[0] = State.highZ;
                    } else {
                        x.valueAtTime[0] = x.value;
                    }
                });

            }
        });
        this.modules.forEach(m => {
            m.inputs.forEach(x => {
                if (x.connectedToOutput().outputsCount == 0) {
                    x.isHighZ = true;
                    x.value = State.highZ;
                    x.valueAtTime[0] = State.highZ;
                }
            });
        });
        console.log(startingNodes);
        startingNodes.forEach(node => {
            node.totalDelay = [0];
            let stack = [];
            let traversed = new Set();
            let marked = new Set();
            stack.push(node);
            while (stack.length > 0) {
                let src = stack.pop();
                let srcDelay = src.totalDelay;
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    // console.log('-', src.owner.name, src.name);
                    src.connections.forEach(wire => {
                        let dest = wire.destination;
                        // if (traversed.has(dest.id)) return;
                        // let delay = max(last(dest.totalDelay),
                        //                 last(src.totalDelay));
                        let delay = srcDelay;
                        // console.log(dest.name, src, src.totalDelay)
                        dest.totalDelay = dest.totalDelay.concat(delay);
                        dest.totalDelay = [...new Set(dest.totalDelay)];
                        stack.push(dest);
                    });
                    if (src.nodeType == 'input') {
                        let outputs = src.owner.outputs;
                        outputs.forEach(outputNode => {

                            let stack2 = [];
                            let traversed2 = new Set();
                            stack2.push(outputNode);
                            while (stack2.length > 0) {
                                let x = stack2.pop();
                                if (!traversed2.has(x.id)) {
                                    traversed2.add(x.id);
                                    traversed.delete(x.id);
                                    x.connections.forEach(w => {
                                        let d = w.destination;
                                        stack2.push(d);
                                    })
                                }
                            }

                            traversed.delete(outputNode.id);
                            /*
                            let delay = max(last(outputNode.totalDelay),
                                        last(src.totalDelay) + outputNode.delay);
                            */
                            let delay = src.totalDelay.map(x => x + outputNode.delay);
                            outputNode.totalDelay = outputNode.totalDelay.concat(delay);
                            outputNode.totalDelay = [...new Set(outputNode.totalDelay)];
                            stack.push(outputNode);
                        });
                    }
                }
            }
        });
        let queue = [];
        let nodes = this.getNodes();
        nodes.forEach(node => {
            // console.log('!', node.name, node.totalDelay)
            // node.totalDelay = [...new Set(node.totalDelay)];
            // node.valueAtTime
            node.totalDelay.sort();
            node.totalDelay.forEach(t => {
                queue.push([t, node]);
            });
        });
        queue = queue.sort((a, b) => a[0] - b[0]);
        // console.log('q', queue.filter(x => x[1].nodeType == 'output'));
        queue
            .filter(x => x[1].nodeType == 'output' || x[1].nodeType == 'node')
            .forEach(x => {
                x[1].setValue(x[1].value, x[0]);
                x[1].owner.evaluate(x[0], x[0], true);
                // console.log('-', x[1].name)
            });
    }
    toModule() {
        this.inputs = this.inputModules.map(x => x.outputs[0]);
        this.outputs = this.outputModules.map(x => x.inputs[0]);
        this.isSubModule = true;
        return this;
    }
}

let nameID = 0;
var circuit = new Circuit('Circuit');
var customModules = {};

function saveModule() {
    let name = 'MODULE' + nameID;
    // let newModule = Object.assign(Object.create(Object.getPrototypeOf(circuit)), circuit);
    let newModule = circuit;
    console.log(newModule)
    newModule.name = name;
    newModule.displayName = name;
    newModule.width = 3;
    newModule.height = max(newModule.inputModules.length, newModule.outputModules.length) + 1;
    customModules[name] = newModule.toModule();
    console.log(customModules[name])
    circuit = new Circuit('Circuit');
    let button = document.createElement('button');
    button.textContent = name;
    button.addEventListener('click', () => circuit.addModule(customModules[name]));
    document.getElementById('module-button-container').appendChild(button);
    console.log(customModules[name])
    nameID++;
}