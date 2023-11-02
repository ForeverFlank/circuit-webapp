function getPortsFromGate(gate, portType) {
    let x = [];
    for (let i = 0; i < gate[portType].length; i++) {
        x.push({
            name: gate[portType][i][0],
            state: 0
        });
    }
    return x;
}

class Module {
    constructor(name, inputs, outputs, obj, pos) {
        this.name = name;
        this.inputs = inputs;
        this.outputs = outputs;
        this.obj = obj;
        this.pos = pos;
        this.modules = [];
        this.wires = [];
    }
    addModule(module) {
        this.modules.push(module);
    }
    addWire(fromModule, fromPort, toModule, toPort) {
        this.wires.push({
            fromModule,
            fromPort,
            toModule,
            toPort
        });
        console.log('from out', fromModule.outputs)
        for (let i = 0; i < fromModule.outputs.length; i++) {
        // for (const port of fromModule.outputs) {
            if (fromModule.outputs[i].name == fromPort)
            {
                let source = fromModule.outputs.find(x => x.name == fromPort);
                let dest = toModule.inputs.find(x => x.name == toPort);
                console.log('dest', toModule, dest)
                dest.state = source.state;
            }
        }
    }
    getPortsByName(name) {
        let ports = this.inputs.concat(this.outputs);
        for (const port of ports) {
            if (port.name == name)
                return port;
        }
        throw new Error(`No port ${name} found in gate ${this.name}!`);
    }
    setPortStateByName(name, s) {
        let port = this.getPortsByName(name);
        port.state = s;
    }
    evaluate() {
        let visitedWires = new Set();
    
        const traverseWire = (wire) => {
            if (!visitedWires.has(wire)) {
                visitedWires.add(wire);
                const sourceOutput = wire.fromModule.getPortsByName(wire.fromPort);
                wire.toModule.setPortStateByName(wire.toPort, sourceOutput);
            }
        };
    
        for (const gate of this.modules) {
            gate.gateEvaluate();
        }
    
        for (const wire of this.wires) {
            traverseWire(wire);
        }
      }
}

class Gate extends Module {
    constructor(gateName) {
        let gate = gates[gateName];
        let inputs = getPortsFromGate(gate, 'inputs');
        let outputs = getPortsFromGate(gate, 'outputs');
        super(gateName, inputs, outputs);
    }
    gateEvaluate() {
        for (let i = 0; i < this.outputs.length; i++) {
            let input = this.inputs.map(x => x[2]);
            console.log('input ' + input);
            let op = gates[this.gateName].outputs[i][2];
            this.outputs[i].state = op(input);
        }
        console.log('Evaluating ' + this.name + '!');
    }
}

class InputNode extends Module {
    constructor() {
        let gate = gates['in'];
        super('in', [], getPortsFromGate(gate, 'outputs'));
    }
    setState(s) {
        this.outputs[0].state = s;
    }
}

class OutputNode extends Module {
    constructor() {
        let gate = gates['out'];
        super('out', getPortsFromGate(gate, 'inputs'), []);
    }
}

/*
class Wire {
    constructor(from, fromPort, to, toPort) {
        this.from = from;
        this.fromPort = fromPort
        this.to = to;
        this.toPort = toPort;
    }
}
*/

var circuit = new Module();

let in1 = new InputNode('in');
let in2 = new InputNode('in');
let and = new Gate('and');
let out = new OutputNode('out');

// console.log('1', circuit);

circuit.addModule(in1);
circuit.addModule(in2);
circuit.addModule(and);
circuit.addModule(out);

// console.log('2', circuit);

circuit.addWire(in1, 'Output', and, 'Input 1');
circuit.addWire(in2, 'Output', and, 'Input 2');
circuit.addWire(and, 'Output', out, 'Input');

// console.log('3', circuit);

in1.setState(state.high);
in2.setState(state.high);

console.log('4', circuit);

out.evaluate();

// console.log('5', circuit);