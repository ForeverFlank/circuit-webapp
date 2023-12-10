/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="./camera.ts" />
// import * as p5 from 'p5';
// import { controls } from './camera.js';

// TODO
// multi bits wire
// graph search >=2 outputs with non high Z and throws error
// subcircuits
// rotation
// cleanup next googol years

const DEBUG = 0;
const NODE_HOVERING_RADIUS = 8;

// function containerWidth() {
//     return document.getElementById('canvas-container').clientWidth; }
// function containerHeight() {
//     return document.getElementById('canvas-container').clientHeight; }

var mouseCanvasX: number;
var mouseCanvasY: number;
function mouseUpdate() {
    mouseCanvasX = (mouseX - controls.view.x - containerWidth() / 2) / controls.view.zoom;
    mouseCanvasY = (mouseY - controls.view.y - containerHeight() / 2) / controls.view.zoom;
}

var isDrawingWire = false;
var clickedNode;
function setClickedNode(node) {
    clickedNode = node;
}

var wireNodeLookup = {};
var pressedObjectID: any = 0;
function setPressedObjectID(id) {
    pressedObjectID = id;
}

var placeX = 0;
var placeY = 0;

class State {
    err = -2;
    highZ = -1;
    low = 0;
    high = 1;
    not(s) {
        if (s == state.err || s == state.highZ) return state.err;
        if (s == state.high) return state.low;
        return state.high;
    }
    and(s) {
        for (let i in s)
            if (s[i] == state.low) return state.low;
        for (let i in s)
            if (s[i] == state.err || s[i] == state.highZ) return state.err;
        return state.high;
    }
    or(s) {
        for (let i in s)
            if (s[i] == state.high) return state.high;
        for (let i in s)
            if (s[i] == state.err || s[i] == state.highZ) return state.err;
        return state.low;
    }
    color(s) {
        if (s == state.err) return color(128, 0, 0);
        if (s == state.highZ) return color(128, 128, 128);
        if (s == state.low) return color(255, 0, 0);
        if (s == state.high) return color(0, 255, 0);
    }
}

const state = new State();

var uniqueNumber = 0;

function unique(str = '') {
    uniqueNumber++;
    return str + '_' + uniqueNumber.toString() + '_' + Math.floor(Math.random() * 2 ** 32).toString(16) + Date.now().toString(16);
}

class Wire {
    source: ModuleNode;
    destination: ModuleNode;
    rendered: boolean;
    id: string;
    isHovering: boolean;
    constructor(source, destination, rendered = true, name = '') {
        this.source = source;
        this.destination = destination;
        this.rendered = rendered;
        this.id = unique(name);
        this.isHovering = false;
    }
    checkHovering() {
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();
        // const a = createVector(sourceX, sourceY);
        // const b = createVector(destinationX, destinationY);
        // const c = createVector(mouseCanvasX, mouseCanvasY);
        const distance = (u, v) => sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
        const sub = (u, v) => { return { x: u.x - v.x, y: u.y - v.y} };
        const mag = (v) => distance(v, { x: 0, y: 0} );
        const angle = (u, v) => acos((u.x * v.x + u.y * v.y) / (mag(u) * mag(v)));

        const a = { x: sourceX, y: sourceY };
        const b = {x:destinationX, y:destinationY};
        const c = {x:mouseCanvasX, y:mouseCanvasY};

        // const l = p5.Vector.sub(a, b).mag();
        const l = mag(sub(a, b));
        const radius = 6;

        if (distance(a, c) > l + radius / 2 || distance(b, c) > l + radius / 2) {
            return false;
        }

        // const ab = p5.Vector.sub(a, b);
        // const bc = p5.Vector.sub(b, c);
        const ab = sub(a, b);
        const bc = sub(b, c);

        // return abs(sin(ab.angleBetween(bc))) * mag(bc) <= radius / 2;
        return abs(sin(angle(ab, bc))) * mag(bc) <= radius / 2;
    }
    setDirection(from, to) {
        console.log(from, from.id == this.source.id)
        this.rendered = (from.id == this.source.id);
        let hiddenWire = to.connections.find((x) => x.destination.id == from.id);
        hiddenWire.rendered = !(from.id == this.source.id);
    }
    render() {
        if (!this.rendered) return;
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();

        let length = sqrt((sourceX - destinationX) ** 2 + (sourceY - destinationY) ** 2);
        let angle = atan2(destinationY - sourceY, destinationX - sourceX);

        push();
        stroke(0);
        strokeWeight(2);
        fill(state.color(this.source.value));
        translate((destinationX + sourceX) / 2, (destinationY + sourceY) / 2);
        rotate(angle);
        let width = this.isHovering ? 10 : 6;
        rect(-length / 2, -width / 2, length, width);
        pop();
        if (!(this.source.value == state.highZ &&
            this.destination.value == state.highZ)) {

            push();
            noStroke();
            fill(color(255, 255, 0));
            const dotDistance = 20;
            const speed = 2;
            let dotCount = Math.floor(length / dotDistance);
            for (let i = 0; i < dotCount; i++) {
                let t = (speed * Date.now() / (length * dotDistance) + i / dotCount) % 1;
                let deltaX = destinationX - sourceX;
                let deltaY = destinationY - sourceY;
                circle(sourceX + deltaX * t, sourceY + deltaY * t, 5);
            }
            pop();
        }
    }
    pressed() {
        this.isHovering = this.checkHovering();
        if (!this.rendered) return;
        if (this.isHovering) {
            if (mouseButton == RIGHT) {
                this.source.disconnect(this.destination);
                return this;
            }
        }
        return false;
    }
}

class ModuleNode {
    owner: Module;
    name: string;
    id: string;
    value: number;
    connections: Wire[];
    nodeType: string;
    relativeX: number; relativeY: number;
    isDragging: boolean;
    isHovering: boolean;
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        this.owner = owner;
        this.name = name;
        this.id = unique(name);
        this.value = value;
        this.connections = [];
        this.relativeX = relativeX;
        this.relativeY = relativeY;
        this.isDragging = false;
        this.isHovering = false;
    }
    isConnected() {
        return this.connections.length > 0;
    }
    getValue() {
        return this.value;
    }
    setValue(value, evaluate = true, traversed = new Set()) {
        this.value = value;
        if (evaluate) {
            this.owner.evaluate();
        }
        this.connections.forEach((wire) => {
            // let src = wire.source;
            let dest = wire.destination;
            if (!traversed.has(dest.id)) {
                dest.setValue(value, true, traversed.add(this.id));
            }
        });
    }
    getCanvasX() {
        return this.owner.x + this.relativeX * 20;
    }
    getCanvasY() {
        return this.owner.y + this.relativeY * 20;
    }
    connect(node) {
        if (this.id == node.id) return;
        if (this.connections.indexOf(new Wire(this, node)) >= 0) return;
        this.connections.push(new Wire(this, node));
        node.connections.push(new Wire(node, this, false));

        if (node.value == state.highZ) {
            this.setValue(this.value);
        } else {
            node.setValue(node.value);
        }
    }
    disconnect(node) {
        let wire;
        wire = node.connections.find((x) => (
            x.source.id == node.id &&
            x.destination.id == this.id));
        node.connections = node.connections.filter(x => x != wire);

        wire = this.connections.find((x) => (
            x.source.id == this.id &&
            x.destination.id == node.id));
        this.connections = this.connections.filter(x => x != wire);

        node.owner.evaluate();
        this.owner.evaluate();
    }
    disconnectAll() {
        this.connections.forEach((x) => {
            x.source.disconnect(x.destination);
        });
    }
    checkHovering() {
        let result =
            (mouseCanvasX - this.getCanvasX()) ** 2 +
            (mouseCanvasY - this.getCanvasY()) ** 2 <=
            NODE_HOVERING_RADIUS ** 2;
        return result;
    }
    render() {
        stroke(0);
        strokeWeight(2);
        let netX = this.getCanvasX();
        let netY = this.getCanvasY();
        if (this.isDragging) {
            line(netX, netY, mouseCanvasX, mouseCanvasY);
        } else if (this.isDragging) {
        } else {
        }
        stroke(0);
        strokeWeight(2);
        fill(state.color(this.value));
        circle(netX, netY, this.isDragging ? 14 : 10);
        if (DEBUG) {
            push();
            text(this.id.slice(0, 10), netX, netY - 10);
            pop();
        }
    }
    pressed() {
        this.isHovering = this.checkHovering();
        if (this.isHovering && pressedObjectID == 0) {
            pressedObjectID = this.id;
            if (mouseButton == LEFT) {
                line(this.getCanvasX(), this.getCanvasY(), mouseCanvasX, mouseCanvasY);
                clickedNode = this;
                this.isDragging = true;
                return true;
            }
            if (mouseButton == RIGHT) {
                this.disconnectAll();
            }

        }
        return false;
    }
    released() {
        this.isDragging = false;
        if (this.isHovering) {
            if (clickedNode != null) {
                clickedNode.connect(this);
                clickedNode = null;
                return true;
            }
        }
        this.isHovering = false;
    }
    addWireNode() {
        let x = Math.round(mouseCanvasX / 20) * 20;
        let y = Math.round(mouseCanvasY / 20) * 20
        let dest = WireNode.add(x, y);
        clickedNode.connect(dest.inputs[0]);
        clickedNode = null;
    }
}

class InputNode extends ModuleNode {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = 'input';
    }
    connect(node) {
        super.connect(node);
    }
    disconnect(node) {
        super.disconnect(node);
    }
}

class OutputNode extends ModuleNode {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = 'output';
    }
    connect(node) {
        super.connect(node);
    }
    disconnect(node) {
        super.disconnect(node);
    }
}

class Module {
    x: number; y: number;
    width: number; height: number;
    name: string;
    id: string;
    displayName: string;
    inputs: ModuleNode[];
    outputs: ModuleNode[];
    isSubModule: boolean;
    isDragging: boolean;
    mouseDown: boolean;
    isHovering: boolean;
    rawX: number; rawY: number;
    offsetX: number; offsetY: number;
    constructor(name, x = 0, y = 0, width = 2, height = 2) {
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.id = unique(name);
        this.displayName = '';
        this.inputs = [];
        this.outputs = [];
        this.isDragging = false;
        this.mouseDown = false;
        this.isHovering = false;
    }
    checkHovering() {
        let hoveringNode = false;
        this.inputs.forEach((x) => { hoveringNode ||= x.checkHovering() });
        this.outputs.forEach((x) => { hoveringNode ||= x.checkHovering() });
        let hovering = mouseCanvasX > this.x &&
            mouseCanvasX < this.x + this.width * 20 &&
            mouseCanvasY > this.y &&
            mouseCanvasY < this.y + this.height * 20 &&
            !hoveringNode;
        return hovering;
    }
    evaluate(checkDisconnectedInput = true, evaluated = new Set()) {
        // console.log('called from', this.id, checkDisconnectedInput);
        // DFS
        if (checkDisconnectedInput) {
            this.inputs.forEach((x) => {
                let stack = [];
                let traversed = new Set();
                let marked = new Set();
                stack.push(x);
                let connectedToOutput = false;
                let outputsCount = 0;
                while (stack.length > 0) {
                    let src = stack.pop();
                    if (!traversed.has(src.id)) {
                        traversed.add(src.id);
                        src.connections.forEach((w) => {
                            let dest = w.destination;
                            stack.push(dest);
                            // u.destination.owner.evaluate(false);
                            if (dest.nodeType == 'output') {
                                connectedToOutput ||= true;
                                if (dest.value != state.highZ &&
                                    !marked.has(dest.id)) {
                                    outputsCount++;
                                    marked.add(dest.id);
                                }
                            }
                        });
                    }
                }
                if (!connectedToOutput) {
                    // console.log('not')
                    x.value = state.highZ;
                    x.connections.forEach((y) => {
                        y.destination.value = state.highZ;
                        if (!evaluated.has(this.id)) {
                            y.destination.owner.evaluate(false, evaluated.add(this.id));
                        }
                    });
                } else {
                    // console.log(outputsCount)
                    if (outputsCount >= 2) {
                        throw new Error('Shortage');
                    }
                }
            });
        }
        // console.log('called from', this.id);
        this.outputs.forEach((x) => {
            let stack = [];
            let traversed = new Set();
            let marked = new Set();
            stack.push(x);
            while (stack.length > 0) {
                let src = stack.pop();
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    marked.add(src.id);
                    src.connections.forEach((w) => {
                        let dest = w.destination;
                        stack.push(dest);
                        if (!marked.has(dest.id))
                            w.setDirection(src, dest);
                        if (this.inputs.some(x => x.id == dest.id))
                            throw new Error('Circular Loop!');
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
            // this.rawX = mouseCanvasX + this.offsetX;
            // this.rawY = mouseCanvasY + this.offsetY;
            // this.x = round(this.rawX / 20) * 20;
            // this.y = round(this.rawY / 20) * 20;
            fill(160);
        } else if (this.isDragging) {
            fill(220);
        } else {
            fill(255);
        }
        stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.width * 20, this.height * 20);
        noStroke();
        fill(0);
        textAlign(CENTER);
        text(name, this.width * 20 / 2 + this.x, this.height * 20 / 2 + this.y + 3);
        if (DEBUG) {
            push();
            text(this.id.slice(0, 10), this.x, this.y + 40);
            text(this.isDragging, this.x, this.y + 55);
            pop();
        }
    }
    pressed(): any {
        this.isHovering = this.checkHovering();
        if (this.isHovering && pressedObjectID == 0) {
            if (mouseButton == LEFT) {
                pressedObjectID = this.id;
                // this.pressedX = this.x;
                // this.pressedY = this.y;
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
    released() {
        this.isDragging = false;
        this.isHovering = false;
    }
}

class WireNode extends Module {
    constructor(name, x, y) {
        super(name, x, y, 0, 0);
        this.inputs = [new ModuleNode(this, 'node', 0, 0, state.highZ)];
    }
    checkHovering() {
        return this.inputs[0].checkHovering();
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
                    src.connections.forEach((w) => {
                        let dest = w.destination;
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
                            src.connections.forEach((w) => {
                                let dest = w.destination;
                                stack2.push(dest);
                                dest.value = state.highZ;
                            });
                        }
                    }
                });
            }
        });
    }
    pressed() {
        if (this.checkHovering() && pressedObjectID == 0) {
            pressedObjectID = this.id;
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
        let module = new WireNode('', x, y)
        circuit.addModule(module);
        return module;
    }
}

class Input extends Module {
    outputState: number;
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.outputState = state.low;
        this.outputs = [new OutputNode(this, 'out1', 2, 1, state.low)];
    }
    setInput(value) {
        this.outputs[0].setValue(value);
    }
    evaluate() {
        super.evaluate();
    }
    render() {
        let char;
        if (this.outputState == state.low) {
            char = '0';
        } else {
            char = '1';
        }
        super.render(char);
    }
    released() {
        super.released();
        /*
        if (this.pressedX == this.x && this.pressedY == this.y) {
            if (pressedObjectID == this.id) {
                if (this.outputState == state.low) {
                    this.outputState = state.high;
                } else {
                    this.outputState = state.low;
                }
                this.setInput(this.outputState, false);
                return true;
            }
        }
        */
    }
    static add() {
        let module = new Input('input', placeX, placeY);
        circuit.addInputModule(module);
    }
}

class Output extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1, state.highZ)];
    }
    render() {
        let char;
        if (this.inputs[0].value == state.low) {
            char = '0';
        } else if (this.inputs[0].value == state.high) {
            char = '1';
        } else {
            char = 'Z';
        }
        super.render(char);
    }
    static add() {
        let module = new Output('output', placeX, placeY);
        circuit.addOutputModule(module);
    }
}

class Circuit extends Module {
    modules: Module[];
    inputModules: Module[];
    outputModules: Module[];
    constructor(name) {
        super(name);
        this.modules = [];
        this.inputModules = [];
        this.outputModules = [];
    }
    addModule(module, evaluate = true) {
        this.modules.push(module);
        if (evaluate) {
            module.evaluate();
            this.evaluateInputs();
        }
        return module;
    }
    addInputModule(module, evaluate = true) {
        this.modules.push(module);
        this.inputModules.push(module);
        if (evaluate) {
            module.evaluate();
            this.evaluateInputs();
        }
        return module;
    }
    addOutputModule(module, evaluate = true) {
        this.modules.push(module);
        this.outputModules.push(module);
        if (evaluate) {
            module.evaluate();
            this.evaluateInputs();
        }
        return module;
    }
    removeModule(module, evaluate = true) {
        module.inputs.concat(module.outputs).forEach(x => x.disconnectAll());
        this.modules = this.modules.filter(x => x.id != module.id);
        if (evaluate) {
            module.evaluate();
            this.evaluateInputs();
        }
    }
    evaluateInputs() {
        this.inputModules.forEach((x) => x.evaluate());
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