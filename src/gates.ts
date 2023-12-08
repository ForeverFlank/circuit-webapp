import { State, state, placeX, placeY, Module, InputNode, OutputNode, circuit } from './classes'

class NotGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1)];
        this.outputs = [new OutputNode(this, 'out1', 2, 1)];
        this.displayName = 'NOT';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = state.not(this.inputs[0].getValue());
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NotGate('not', placeX, placeY));
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
        let result = state.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new AndGate('and', placeX, placeY));
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
        let result = state.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new OrGate('or', placeX, placeY));
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
        let result = state.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = state.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NandGate('nand', placeX, placeY));
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
        let result = state.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = state.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NorGate('nor', placeX, placeY));
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
        let p = state.and([a, state.not(b)]);
        let q = state.and([b, state.not(a)]);
        let result = state.or([p, q]);
        result = state.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new XorGate('xor', placeX, placeY));
    }
}