class NotGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1)];
        this.outputs = [new OutputNode(this, 'out1', 2, 1)];
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
            new InputNode(this, 'in1', 0, 0),
            new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
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
            new InputNode(this, 'in1', 0, 0),
            new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
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
            new InputNode(this, 'in1', 0, 0),
            new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
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
            new InputNode(this, 'in1', 0, 0),
            new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
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
            new InputNode(this, 'in1', 0, 0),
            new InputNode(this, 'in2', 0, 2)];
        this.outputs = [new OutputNode(this, 'out1', 3, 1)];
        this.displayName = 'XOR';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let a = this.inputs[0].getValue();
        let b = this.inputs[1].getValue()
        let p = State.and([a, State.not(b)]);
        let q = State.and([b, State.not(a)]);
        let result = State.or([p, q]);
        result = State.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new XorGate('XOR Gate', placeX, placeY));
    }
}