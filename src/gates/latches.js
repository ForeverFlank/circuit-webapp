class SRLatch extends Module {
    constructor(name) {
        super(name, 3, 4);
        this.inputs = [
            new InputNode(this, "Set", 0, 3),
            new InputNode(this, "Reset", 0, 1),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 3, 3),
            new OutputNode(this, "Q'", 3, 1),
        ];
        this.inputs.forEach((node) => node.pinDirection = 0);
        this.outputs.forEach((node) => node.pinDirection = 2);
        this.displayName = "SR";
        this.latchValue = State.low;
    }
    init() {
        super.init();
        this.latchValue = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let s = this.inputs[0].getValue(time);
        let r = this.inputs[1].getValue(time);
        if (this.latchValue == State.low && s[0] == State.high) {
            this.latchValue = State.high;
        }
        if (this.latchValue == State.high && r[0] == State.high) {
            this.latchValue = State.low;
        }
        this.outputs[0].setValue(
            this.latchValue,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
        this.outputs[1].setValue(
            State.not(this.latchValue),
            0,
            time + this.outputs[1].delay,
            false,
            true
        );
    }
    static add() {
        currentCircuit.addModule(new SRLatch("SR Latch"));
    }
}

class DLatch extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputs = [
            new InputNode(this, "Data", 0, 2),
            new InputNode(this, "Enable", 0, 0),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 2, 2),
            new OutputNode(this, "Q'", 2, 0),
        ];
        this.inputs.forEach((node) => node.pinDirection = 0);
        this.outputs.forEach((node) => node.pinDirection = 2);
        this.displayName = "D";
        this.latchValue = State.low;
    }
    init() {
        super.init();
        this.latchValue = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let d = this.inputs[0].getValue(time);
        let e = this.inputs[1].getValue(time);
        if (e[0] == State.high) {
            this.latchValue = d[0];
        }
        this.outputs[0].setValue(
            this.latchValue,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
        this.outputs[1].setValue(
            State.not(this.latchValue),
            0,
            time + this.outputs[1].delay,
            false,
            true
        );
    }
    static add() {
        currentCircuit.addModule(new DLatch("D Latch"));
    }
}
