class Splitter extends Module {
    constructor(name) {
        super(name, 1, 2);
        this.inputs = [new InputNode(this, "Input", 0, 0)];
        this.outputs = [];
        this.displayName = "";
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        super.render();
    }
    released() {
        super.released();
    }
    static add() {
        circuit.addModule(new Splitter("Splitter"));
    }
}

function setSplitter() {
    
}

class NBitInput extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.outputValue = [State.low, State.low];
        this.outputs = [
            new OutputNode(this, "Output", 2, 1, this.outputValue, 0),
        ];
        this.isSubmoduleIO = false;
    }
    setInput(value, time = 0) {
        this.outputValue = [State.low, State.high];
        this.outputs[0].setValues(this.outputValue, time, true, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        super.render(this.outputValue, 12, -5, 0, "basic/input");
    }
    released() {
        super.released();
    }
    static add() {
        let module = new NBitInput("N-Bit Input");
        circuit.addInputModule(module);
    }
}
