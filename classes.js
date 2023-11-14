'use strict';

var mouseCanvasX;
var mouseCanvasY;

var isDrawingWire = false;
var clickedNode;

const state = {
    highZ: -1,
    low: 0,
    high: 1,
    op: {
        not: (s) => {
            if (s == state.high) return state.low;
            return state.high;
        },
        and: (s) => {
            for (let i in s)
                if (s[i] != state.high) return state.low;
            return state.high;
        },
        or: (s) => {
            for (let i in s)
                if (s[i] == state.high) return state.high;
            return state.low;
        }
    },
    color: (s) => {
        if (s == state.highZ) return color(128, 128, 128);
        if (s == state.low) return color(255, 0, 0);
        if (s == state.high) return color(0, 255, 0);
    }
}

class Wire {
    constructor(source, destination, value = state.highZ) {
        this.source = source;
        this.destination = destination;
        this.value = value;
    }
    render() {
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();
        stroke(0);
        strokeWeight(2);
        line(sourceX, sourceY, destinationX, destinationY);
    }
}

class Node {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        this.value = null;
        this.owner = owner;
        this.name = name;
        this.value = value;
        this.connections = [];
        this.relativeX = relativeX;
        this.relativeY = relativeY;
        this.dragging = false;
        // console.log(name, owner)
    }
    isConnected() {
        return !(this.connections == []);
    }
    getValue() {
        return this.value;
    }
    setValue(value, evaluated = true) {
        this.value = value;
        if (evaluated)
            this.owner.evaluate();
        // console.log('!', this.connections)
        this.connections.forEach((x) => {
            let dest = x.destination;
            dest.setValue(value);
        });
    }
    getCanvasX() {
        return this.owner.x + this.relativeX * 20;
    }
    getCanvasY() {
        return this.owner.y + this.relativeY * 20;
    }
    isHovering() {
        let result = (mouseCanvasX - this.getCanvasX()) ** 2 +
            (mouseCanvasY - this.getCanvasY()) ** 2 <= 5 ** 2
        return result;
    }
    render() {
        stroke(0);
        strokeWeight(2);
        let netX = this.getCanvasX();
        let netY = this.getCanvasY();
        this.connections.forEach((x) => {
            x.render();
        });
        let hovering = this.isHovering();
        if (this.dragging) {
            line(netX, netY, mouseCanvasX, mouseCanvasY);
        } else if (hovering) {
            // fill(180);
        } else {
            // 
        }
        stroke(0);
        strokeWeight(2);
        fill(state.color(this.value));
        circle(netX, netY, hovering ? 14 : 10);
    }
    pressed() {
        if (this.isHovering()) {
            line(this.getCanvasX(), this.getCanvasY(), mouseCanvasX, mouseCanvasY);
            clickedNode = this;
            this.dragging = true;
            return true;
        }
        return false;
    }
    released() {
        console.log(this)
        if (this.isHovering()) {
            clickedNode.connectToInput(this);
        }
        this.owner.evaluate();
        this.dragging = false;
    }
}

class InputNode extends Node {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = 'input';
    }
    connectToOutput(output) {
        output.connections.push(new Wire(output, this));
    }
    connectToInput(input) {
        output.connections.push(new Wire(output, this));
    }
    released() {
        if (this.isHovering()) {
            if (clickedNode.nodeType == 'output')
                clickedNode.connectToInput(this);
        }
        this.owner.evaluate();
        this.dragging = false;
    }
}

class OutputNode extends Node {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = state.highZ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = 'output';
    }
    connectToInput(input) {
        this.connections.push(new Wire(this, input));
    }
    released() {
        if (this.isHovering()) {
            if (clickedNode.nodeType == 'input')
                clickedNode.connectToOutput(this);
        }
        this.owner.evaluate();
        this.dragging = false;
    }
}

class Module {
    constructor(name, x, y, w = 2, h = 2) {
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.w = w;
        this.h = h;
        this.name = name;
        this.displayName = '';
        this.inputs = [];
        this.outputs = [];
        this.dragging = false;
        this.rollover = false;
        this.mouseDown = false;
    }
    isHovering() {
        let hoveringNode = false;
        this.inputs.forEach((x) => { hoveringNode |= x.isHovering() });
        this.outputs.forEach((x) => { hoveringNode |= x.isHovering() });
        this.rollover = mouseCanvasX > this.x &&
            mouseCanvasX < this.x + this.w * 20 &&
            mouseCanvasY > this.y &&
            mouseCanvasY < this.y + this.h * 20 &&
            !hoveringNode;
        return this.rollover;
    }
    render(name = this.displayName) {
        let hovering = this.isHovering();
        if (this.dragging) {
            this.rawX = mouseCanvasX + this.offsetX;
            this.rawY = mouseCanvasY + this.offsetY;
            this.x = round(this.rawX / 20) * 20;
            this.y = round(this.rawY / 20) * 20;
        }
        if (this.dragging) {
            fill(160);
        } else if (hovering) {
            fill(220);
        } else {
            fill(255);
        }
        stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.w * 20, this.h * 20);
        noStroke();
        fill(0);
        textAlign(CENTER);
        text(name, this.w * 20 / 2 + this.x, this.h * 20 / 2 + this.y + 3);
        this.inputs.forEach((x) => x.render());
        this.outputs.forEach((x) => x.render());
    }
    pressed() {
        if (this.isHovering()) {
            this.mouseDown = true && !this.dragging;
            this.dragging = true;
            if (this.mouseDown) {
                this.rawX = this.x;
                this.rawY = this.y;
            }
            this.offsetX = this.rawX - mouseCanvasX;
            this.offsetY = this.rawY - mouseCanvasY;
            return true;
        }
        return false;
    }
    released() {
        this.dragging = false;
    }
}

class Input extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.outputState = state.low;
        this.outputs = [new OutputNode(this, 'out1', 2, 1, state.low)];
    }
    setInput(value) {
        this.outputs[0].setValue(value);
    }
    pressed() {
        super.pressed();
        if (this.isHovering()) {
            if (this.outputState == state.low)
                this.outputState = state.high;
            else
                this.outputState = state.low;
            this.setInput(this.outputState, false);
            return true;
        }
        return false;
    }
    render() {
        let char;
        if (this.outputState == state.low)
            char = '0';
        else
            char = '1';
        super.render(char)
    }
    evaluate() {
        // this.outputs[0].setValue(this.outputState);
    }
}

class NotGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1)];
        this.outputs = [new OutputNode(this, 'out1', 2, 1)];
        this.displayName = 'NOT';
    }
    evaluate() {
        let result = state.op.not(this.inputs[0].getValue());
        this.outputs[0].setValue(result, false);
    }
}

class AndGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
        new InputNode(this, 'in1', 0, 0),
        new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
        this.displayName = 'AND';
    }
    evaluate() {
        let result = state.op.and([this.inputs[0].getValue(),
        this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
}

class OrGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
        new InputNode(this, 'in1', 0, 0),
        new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
        this.displayName = 'OR';
    }
    evaluate() {
        let result = state.op.or([this.inputs[0].getValue(),
        this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
}

/*
let and = new AndGate('a1');
and.inputs[0].setValue(state.high);
and.inputs[1].setValue(state.high);
let not = new NotGate('n1');
and.outputs[0].connect(not.inputs[0]);
and.inputs[1].setValue(state.low);
console.log(and);
console.log(not);
*/

class Circuit extends Module {
    constructor(name) {
        super(name);
        this.modules = [];
    }
    addModule(gate) {
        this.modules.push(gate);
        return gate;
    }
    addInputModule(input) {
        this.modules.push(input);
        this.inputs.push(input.outputs[0]);
        return input;
    }
}

function addInput() {
    let module = new Input(Symbol('input'));
    circuit.addInputModule(module);
    module.evaluate();
}
function addNotGate() {
    let module = new NotGate(Symbol('not'));
    circuit.addModule(module);
    module.evaluate();
}

var circuit = new Circuit();

if (0) {
    let in1 = new Input('i1');
    let in2 = new Input('i2');
    let and1 = new AndGate('a1');
    let and2 = new AndGate('a2');
    let not1 = new NotGate('n1');
    let not2 = new NotGate('n2');
    let or1 = new OrGate('o1');

    circuit.addInputModule(in1);
    circuit.addInputModule(in2);
    circuit.addModule(and1);
    circuit.addModule(and2);
    circuit.addModule(not1);
    circuit.addModule(not2);
    circuit.addModule(or1);

    // S = A(-B) + (-A)B

    in1.outputs[0].connect(not2.inputs[0]);     // -A
    in2.outputs[0].connect(not1.inputs[0]);     // -B

    console.log(in1);
    console.log(in2);

    // A(-B)
    in1.outputs[0].connect(and1.inputs[0]);
    not1.outputs[0].connect(and1.inputs[1]);

    // console.log(and1);

    // (-A)B
    not2.outputs[0].connect(and2.inputs[0]);
    in2.outputs[0].connect(and2.inputs[1]);

    // +
    and1.outputs[0].connect(or1.inputs[0]);
    and2.outputs[0].connect(or1.inputs[1]);

    in1.setInput(state.low);
    in2.setInput(state.low);
    console.log('0 xor 0 =', or1.outputs[0].value);

    in1.setInput(state.low);
    in2.setInput(state.high);
    console.log('0 xor 1 =', or1.outputs[0].value);

    in1.setInput(state.high);
    in2.setInput(state.low);
    console.log('1 xor 0 =', or1.outputs[0].value);

    in1.setInput(state.high);
    in2.setInput(state.high);
    console.log('1 xor 1 =', or1.outputs[0].value);
}