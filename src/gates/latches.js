class SRLatch extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Set", 0, 1),
            new InputNode(this, "Reset", 0, 3),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 1),
            new OutputNode(this, "Q'", 4, 3),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "SR";
        this.latchValue = State.low;
    }
    render() {
        super.render([
            ["S", 12, -25, -20, LEFT],
            ["R", 12, -25, 20, LEFT],
            ["Q", 12, 25, -20, RIGHT],
            ["Q'", 12, 25, 20, RIGHT],
        ]);
    }
    init() {
        super.init();
        this.latchValue = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let s = this.inputs[0].getValueAtTime(time)[0];
        let r = this.inputs[1].getValueAtTime(time)[0];
        if (this.latchValue == State.low && s == State.high) {
            this.latchValue = State.high;
        }
        if (this.latchValue == State.high && r == State.high) {
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
        Module.addToCircuit(new SRLatch("SR Latch"));
    }
}

class DLatch extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Data", 0, 1),
            new InputNode(this, "Enable", 0, 3),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 1),
            new OutputNode(this, "Q'", 4, 3),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "D";
        this.latchValue = State.low;
    }
    render() {
        super.render([
            ["D", 12, -25, -20, LEFT],
            ["EN", 12, -25, 20, LEFT],
            ["Q", 12, 25, -20, RIGHT],
            ["Q'", 12, 25, 20, RIGHT],
        ]);
    }
    init() {
        super.init();
        this.latchValue = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let d = this.inputs[0].getValueAtTime(time)[0];
        let e = this.inputs[1].getValueAtTime(time)[0];
        if (e == State.high) {
            this.latchValue = d;
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
        Module.addToCircuit(new DLatch("D Latch"));
    }
}

class TFlipFlop extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "T", 0, 1),
            new InputNode(this, "Clock", 0, 2),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 1),
            new OutputNode(this, "Q'", 4, 3),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "T";
        this.latchValue = State.low;
        this.previousClk = State.low;
    }
    render() {
        super.render([
            ["T", 12, -25, -20, LEFT],
            [">", 24, -24, 0],
            ["Q", 12, 25, -20, RIGHT],
            ["Q'", 12, 25, 20, RIGHT],
        ]);
    }
    init() {
        super.init();
        this.latchValue = State.low;
        this.previousClk = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let t = this.inputs[0].getValueAtTime(time)[0];
        let clk = this.previousClk;
        this.previousClk = this.inputs[1].getValueAtTime(time)[0];
        let rising = this.previousClk != clk && this.previousClk == State.high;
        if (rising && t == State.high) {
            if (this.latchValue == State.high) {
                this.latchValue = State.low;
            } else if (this.latchValue == State.low) {
                this.latchValue = State.high;
            }
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
        Module.addToCircuit(new TFlipFlop("T Flip Flop"));
    }
}

class JKFlipFlop extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "J", 0, 1),
            new InputNode(this, "K", 0, 3),
            new InputNode(this, "Clock", 0, 2),
        ];
        this.outputs = [
            new OutputNode(this, "Q", 4, 1),
            new OutputNode(this, "Q'", 4, 3),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "T";
        this.latchValue = State.low;
        this.previousClk = State.low;
    }
    render() {
        super.render([
            ["J", 12, -25, -20, LEFT],
            ["K", 12, -25, 20, LEFT],
            [">", 24, -24, 0],
            ["Q", 12, 25, -20, RIGHT],
            ["Q'", 12, 25, 20, RIGHT],
        ]);
    }
    init() {
        super.init();
        this.latchValue = State.low;
        this.previousClk = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let j = this.inputs[0].getValueAtTime(time)[0];
        let k = this.inputs[1].getValueAtTime(time)[0];

        let clk = this.previousClk;
        this.previousClk = this.inputs[2].getValueAtTime(time)[0];
        let rising = this.previousClk != clk && this.previousClk == State.high;

        if (rising) {
            this.latchValue = State.or([
                State.and([j, State.not(this.latchValue)]),
                State.and([this.latchValue, State.not(k)]),
            ]);
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
        Module.addToCircuit(new JKFlipFlop("JK Flip Flop"));
    }
}
