class SRLatch extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Set", 0, 3),
            new InputNode(this, "Reset", 0, 1),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 3),
            new OutputNode(this, "Q'", 4, 1),
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
        let s = this.inputs[0].getValueAtTime(time);
        let r = this.inputs[1].getValueAtTime(time);
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
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Data", 0, 3),
            new InputNode(this, "Enable", 0, 1),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 3),
            new OutputNode(this, "Q'", 4, 1),
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
        let d = this.inputs[0].getValueAtTime(time);
        let e = this.inputs[1].getValueAtTime(time);
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
