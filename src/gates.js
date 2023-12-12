class NotGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'Input 1', 0, 1)];
        this.outputs = [new OutputNode(this, 'Output', 2, 1)];
        this.displayName = 'NOT';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.not(this.inputs[0].getValue());
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NotGate('NOT Gate', placeX, placeY));
    }
}

class AndGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'AND';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new AndGate('AND Gate', placeX, placeY));
    }
}

class OrGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'OR';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new OrGate('OR Gate', placeX, placeY));
    }
}

class NandGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'NAND';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = State.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NandGate('NAND Gate', placeX, placeY));
    }
}

class NorGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'NOR';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = State.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NorGate('NOR Gate', placeX, placeY));
    }
}

class XorGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'XOR';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.xor(
            this.inputs[0].getValue(),
            this.inputs[1].getValue());
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new XorGate('XOR Gate', placeX, placeY));
    }
}

class XnorGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 2)];
        this.outputs = [new OutputNode(this, 'Output', 3, 1)];
        this.displayName = 'XNOR';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = State.not(State.xor(
            this.inputs[0].getValue(),
            this.inputs[1].getValue()));
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new XnorGate('XNOR Gate', placeX, placeY));
    }
}

class FullAdder extends Module {
    constructor(name, x, y) {
        super(name, x, y, 3, 2);
        this.inputs = [
            new InputNode(this, 'Input 1', 0, 0),
            new InputNode(this, 'Input 2', 0, 1),
            new InputNode(this, 'Carry In', 0, 2)];
        this.outputs = [
            new OutputNode(this, 'Sum', 3, 0),
            new OutputNode(this, 'Carry Out', 3, 1)];
        this.displayName = 'Full\nAdder';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let a = this.inputs[0].getValue();
        let b = this.inputs[1].getValue();
        let cIn = this.inputs[2].getValue();
        let p = State.xor(a, b);
        let sum = State.xor(p, cIn);
        let cOut = State.or([State.and([a, b]), State.and([p, cIn])]);
        this.outputs[0].setValue(sum, false);
        this.outputs[1].setValue(cOut, false);
    }
    static add() {
        circuit.addModule(new FullAdder('Full Adder', placeX, placeY));
    }
}

class TriStateBuffer extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [
            new InputNode(this, 'Input', 0, 1),
            new InputNode(this, 'Control', 1, 0)];
        this.outputs = [new OutputNode(this, 'Output', 2, 1)];
        this.displayName = '';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let input = this.inputs[0].getValue();
        let control = this.inputs[1].getValue();
        if (control == State.high)
            this.outputs[0].setValue(input, false);
        else if (control == State.low)
            this.outputs[0].setValue(State.highZ, false);
        else
            this.outputs[0].setValue(State.err, false);
    }
    static add() {
        circuit.addModule(new TriStateBuffer('Tri-State Buffer', placeX, placeY));
    }
}