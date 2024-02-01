class NotGate extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.inputs = [new InputNode(this, "Input", 0, 1)];
        this.outputs = [new OutputNode(this, "Output", 3, 1)];
        this.displayName = "NOT";
    }
    render() {
        super.render(this.displayName, 8, -8, 0, "basic/not");
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.not(this.inputs[0].getValue(time)[0]);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new NotGate("NOT Gate"));
    }
}

class AndGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "AND";
    }
    render() {
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/and",
            0,
            -20,
            80,
            80
        );
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.and([
            this.inputs[0].getValue(time)[0],
            this.inputs[1].getValue(time)[0],
        ]);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new AndGate("AND Gate"));
    }
}

class OrGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "OR";
    }
    render() {
        super.render(this.displayName, 12, -5, -10, "basic/or", 0, -20, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.or([
            this.inputs[0].getValue(time)[0],
            this.inputs[1].getValue(time)[0],
        ]);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new OrGate("OR Gate"));
    }
}

class NandGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "NAND";
    }
    render() {
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/nand",
            0,
            -20,
            80,
            80
        );
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.and([
            this.inputs[0].getValue(time)[0],
            this.inputs[1].getValue(time)[0],
        ]);
        result = State.not(result);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new NandGate("NAND Gate", placeX, placeY));
    }
}

class NorGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "NOR";
    }
    render() {
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/nor",
            0,
            -20,
            80,
            80
        );
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.or([
            this.inputs[0].getValue(time)[0],
            this.inputs[1].getValue(time)[0],
        ]);
        result = State.not(result);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new NorGate("NOR Gate", placeX, placeY));
    }
}

class XorGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "XOR";
    }
    render() {
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/xor",
            0,
            -20,
            80,
            80
        );
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.xor(
            this.inputs[0].getValue(time)[0],
            this.inputs[1].getValue(time)[0]
        );
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new XorGate("XOR Gate", placeX, placeY));
    }
}

class XnorGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "XNOR";
    }
    render() {
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/xnor",
            0,
            -20,
            80,
            80
        );
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.not(
            State.xor(
                this.inputs[0].getValue(time)[0],
                this.inputs[1].getValue(time)[0]
            )
        );
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new XnorGate("XNOR Gate", placeX, placeY));
    }
}

class HalfAdder extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 1),
        ];
        this.outputs = [
            new OutputNode(this, "Sum", 3, 0),
            new OutputNode(this, "Carry Out", 3, 1),
        ];
        this.displayName = "Half\nAdder";
    }
    evaluate(time) {
        super.evaluate(time);
        let a = this.inputs[0].getValue(time)[0];
        let b = this.inputs[1].getValue(time)[0];
        let sum = State.xor(a, b);
        let cOut = State.and([a, b]);
        this.outputs[0].setValue(
            sum,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
        this.outputs[1].setValue(
            cOut,
            0,
            time + this.outputs[1].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new HalfAdder("Half Adder", placeX, placeY));
    }
}

class FullAdder extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 1),
            new InputNode(this, "Carry In", 0, 2),
        ];
        this.outputs = [
            new OutputNode(this, "Sum", 3, 0),
            new OutputNode(this, "Carry Out", 3, 1),
        ];
        this.displayName = "Full\nAdder";
    }
    evaluate(time) {
        super.evaluate(time);
        let a = this.inputs[0].getValue(time)[0];
        let b = this.inputs[1].getValue(time)[0];
        let cIn = this.inputs[2].getValue(time)[0];
        let p = State.xor(a, b);
        let sum = State.xor(p, cIn);
        let cOut = State.or([State.and([a, b]), State.and([p, cIn])]);
        this.outputs[0].setValue(
            sum,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
        this.outputs[1].setValue(
            cOut,
            0,
            time + this.outputs[1].delay,
            false,
            true
        );
    }
    static add() {
        circuit.addModule(new FullAdder("Full Adder", placeX, placeY));
    }
}

class TriStateBuffer extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputs = [
            new InputNode(this, "Input", 0, 1),
            new InputNode(this, "Control", 1, 0),
        ];
        this.outputs = [new OutputNode(this, "Output", 2, 1)];
        this.displayName = "";
    }
    evaluate(time) {
        super.evaluate(time);
        let input = this.inputs[0].getValue(time)[0];
        let control = this.inputs[1].getValue(time)[0];
        if (control == State.high)
            this.outputs[0].setValue(
                input,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
        else if (control == State.low)
            this.outputs[0].setValue(
                State.highZ,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
        else
            this.outputs[0].setValue(
                State.err,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
    }
    static add() {
        circuit.addModule(
            new TriStateBuffer("Tri-State Buffer", placeX, placeY)
        );
    }
}
