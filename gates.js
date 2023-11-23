class NotGate extends Module {
    constructor(name, x, y) {
        super(name, x, y, 2, 2);
        this.inputs = [new InputNode(this, 'in1', 0, 1)];
        this.outputs = [new OutputNode(this, 'out1', 2, 1)];
        this.displayName = 'NOT';
    }
    evaluate(checkForDisconnectedInput = true) {
        super.evaluate(checkForDisconnectedInput);
        let result = state.op.not(this.inputs[0].getValue());
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NotGate('not'));
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
        let result = state.op.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new AndGate('and'));
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
        let result = state.op.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new OrGate('or'));
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
        let result = state.op.and([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = state.op.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NandGate('nand'));
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
        let result = state.op.or([
            this.inputs[0].getValue(),
            this.inputs[1].getValue()]);
        result = state.op.not(result);
        this.outputs[0].setValue(result, false);
    }
    static add() {
        circuit.addModule(new NorGate('nor'));
    }
}