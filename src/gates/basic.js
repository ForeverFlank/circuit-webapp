class NotGate extends Module {
    constructor(name) {
        super(name, 4, 2);
        this.inputs = [new InputNode(this, "Input", 0, 1)];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "NOT";
    }
    render() {
        super.render(this.displayName, 10, -6, 0, "basic/not");
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.not(this.inputs[0].getValueAtTime(time)[0]);
        this.outputs[0].setValue(
            result,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        currentCircuit.addModule(new NotGate("NOT Gate"));
    }
}

class AndGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "AND";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/and", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.and([
            this.inputs[0].getValueAtTime(time)[0],
            this.inputs[1].getValueAtTime(time)[0],
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
        currentCircuit.addModule(new AndGate("AND Gate"));
    }
}

class OrGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "OR";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/or", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.or([
            this.inputs[0].getValueAtTime(time)[0],
            this.inputs[1].getValueAtTime(time)[0],
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
        currentCircuit.addModule(new OrGate("OR Gate"));
    }
}

class NandGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "NAND";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/nand", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.and([
            this.inputs[0].getValueAtTime(time)[0],
            this.inputs[1].getValueAtTime(time)[0],
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
        currentCircuit.addModule(new NandGate("NAND Gate", placeX, placeY));
    }
}

class NorGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "NOR";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/nor", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.or([
            this.inputs[0].getValueAtTime(time)[0],
            this.inputs[1].getValueAtTime(time)[0],
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
        currentCircuit.addModule(new NorGate("NOR Gate", placeX, placeY));
    }
}

class XorGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "XOR";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/xor", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.xor(
            this.inputs[0].getValueAtTime(time)[0],
            this.inputs[1].getValueAtTime(time)[0]
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
        currentCircuit.addModule(new XorGate("XOR Gate", placeX, placeY));
    }
}

class XnorGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "XNOR";
    }
    render() {
        super.render(this.displayName, 12, -5, 0, "basic/xnor", 0, 0, 80, 80);
    }
    evaluate(time) {
        super.evaluate(time);
        let result = State.not(
            State.xor(
                this.inputs[0].getValueAtTime(time)[0],
                this.inputs[1].getValueAtTime(time)[0]
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
        currentCircuit.addModule(new XnorGate("XNOR Gate", placeX, placeY));
    }
}

class TriStateBuffer extends Module {
    constructor(name) {
        super(name, 4, 2);
        this.inputs = [
            new InputNode(this, "Input", 0, 1),
            new InputNode(this, "Control", 2, 0),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "";
    }
    render() {
        super.render("", 12, -8, 0, "basic/tristatebuffer");
    }
    evaluate(time) {
        console.warn("EVAL", time);
        super.evaluate(time);
        let input = this.inputs[0].getValueAtTime(time)[0];
        let control = this.inputs[1].getValueAtTime(time)[0];
        if (control == State.high) {
            this.outputs[0].setValue(
                input,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
        } else if (control == State.low) {
            this.outputs[0].setValue(
                State.highZ,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
        } else {
            this.outputs[0].setValue(
                State.err,
                0,
                time + this.outputs[0].delay,
                false,
                true
            );
        }
        super.evaluate(time + this.outputs[0].delay);
    }
    static add() {
        currentCircuit.addModule(
            new TriStateBuffer("Tri-State Buffer", placeX, placeY)
        );
    }
}

class HalfAdder extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [
            new OutputNode(this, "Sum", 4, 1),
            new OutputNode(this, "Carry Out", 4, 2),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "Half\nAdder";
    }
    evaluate(time) {
        super.evaluate(time);
        let a = this.inputs[0].getValueAtTime(time)[0];
        let b = this.inputs[1].getValueAtTime(time)[0];
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
        currentCircuit.addModule(new HalfAdder("Half Adder", placeX, placeY));
    }
}

class FullAdder extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 2),
            new InputNode(this, "Carry In", 0, 3),
        ];
        this.outputs = [
            new OutputNode(this, "Sum", 4, 1),
            new OutputNode(this, "Carry Out", 4, 2),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "Full\nAdder";
    }
    evaluate(time) {
        super.evaluate(time);
        let a = this.inputs[0].getValueAtTime(time)[0];
        let b = this.inputs[1].getValueAtTime(time)[0];
        let cIn = this.inputs[2].getValueAtTime(time)[0];
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
        currentCircuit.addModule(new FullAdder("Full Adder", placeX, placeY));
    }
}

