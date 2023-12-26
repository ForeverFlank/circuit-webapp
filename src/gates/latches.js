class SRLatch extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputs = [new InputNode(this, 'Set', 0, 2),
                       new InputNode(this, 'Reset', 0, 0)];
        this.outputs = [new OutputNode(this, 'Q', 2, 2),
                        new OutputNode(this, 'Q\'', 2, 0)];
        this.displayName = 'SR';
        this.latchValue = State.low;
    }
    evaluate(time) {
        super.evaluate(time);
        let s = this.inputs[0].getValue(time);
        let r = this.inputs[1].getValue(time);
        if (this.latchValue == State.low && s == State.high) {
            this.latchValue = State.high;
        }
        if (this.latchValue == State.high && r == State.high) {
            this.latchValue = State.low;
        }
        this.outputs[0].setValue(this.latchValue, time + this.outputs[0].delay, false, true);
        this.outputs[1].setValue(State.not(this.latchValue), time + this.outputs[1].delay, false, true);
    }
    static add() {
        circuit.addModule(new SRLatch('SR Latch'));
    }
}