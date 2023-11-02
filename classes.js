'use strict';

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
    }
}

class Node {
    constructor(owner, name, value=state.highZ) {
        this.value = null;
        this.owner = owner;
        this.name = name;
        this.value = value;
        this.connections = [];
        // console.log(name, owner)
    }
    isConnected() {
        return !(this.connections == []);
    }
    connect(inputs) {
        if (Array.isArray(inputs))
            this.connections = this.connections.concat(inputs);
        else
            this.connections.push(inputs);
        // console.log('*', this.connections)
    }
    getValue() {
        return this.value;
    }
    setValue(value, evaluated=true) {
        this.value = value;
        if (evaluated)
            this.owner.evaluate();
        // console.log('!', this.connections)
        for (let i in this.connections) {
            this.connections[i].setValue(value);
        }
    }
}

class Module {
    constructor(name) {
        this.name = name;
        this.inputs = [];
        this.outputs = [];
    }
}

class Input extends Module {
    constructor(name) {
        super(name);
        this.outputs = [new Node(this, 'out1')];
    }
    setInput(value) {
        this.outputs[0].setValue(value);
    }
    evaluate() {
    }
}

class NotGate extends Module {
    constructor(name) {
        super(name);
        this.inputs = [new Node(this, 'in1')];
        this.outputs = [new Node(this, 'out1')];
    }
    evaluate() {
        let result = state.op.not(this.inputs[0].getValue());
        this.outputs[0].setValue(result, false);
    }
}

class AndGate extends Module {
    constructor(name) {
        super(name);
        this.inputs = [new Node(this, 'in1'), new Node(this, 'in2')];
        this.outputs = [new Node(this, 'out1')];
    }
    evaluate() {
        let result = state.op.and([this.inputs[0].getValue(),
                                   this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
}

class OrGate extends Module {
    constructor(name) {
        super(name);
        this.inputs = [new Node(this, 'in1'), new Node(this, 'in2')];
        this.outputs = [new Node(this, 'out1')];
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


let in1 = new Input('i1');
let in2 = new Input('i2');
let and1 = new AndGate('a1');
let and2 = new AndGate('a2');
let not1 = new NotGate('n1');
let not2 = new NotGate('n2');
let or1 = new OrGate('o1');

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
/*
*/