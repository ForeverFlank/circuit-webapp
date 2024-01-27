class NBitInput extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.outputValue = State.low;
        this.outputs = [new OutputNode(this, 'out1', 2, 1, State.low, 0)];
        this.isSubmoduleIO = false;
    }
    setInput(value, time = 0) {
        this.outputValue = value;
        this.outputs[0].setValue(this.outputValue, time, true, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        let char = State.char(this.outputValue);
        super.render(char, 12, -5, 0, 'basic/input');
    }
    released() {
        super.released();
    }
    static add() {
        let module = new Input('Input');
        circuit.addInputModule(module);
    }
}