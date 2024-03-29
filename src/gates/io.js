class LED extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputValue = [State.highZ];
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
        this.inputs.forEach((node) => (node.pinDirection = 0));
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        if (this.isHiddenOnAdd) return;
        push();
        stroke(0);
        strokeWeight(2);
        let value = this.inputs[0].getValueAtTime(Infinity)[0];
        let color = value == State.high ? "#e83115" : "#610605";
        fill(color);
        circle(this.x + 20, this.y + 20, 28);
        pop();
        // let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        // super.render([[char, 12, 0, 0]], "basic/output");
    }
    static add() {
        Module.addToCircuit(new LED("LED"));
    }
}

class Display7Segment extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.inputValue = [State.highZ];
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render() {
        // let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        // super.render([[char, 12, 0, 0]], "basic/output");
    }
    static add() {
        let mod = new Display7Segment("7 Segment Display");
        currentCircuit.addOutputModule(mod);
        mod.ignoreDiv = true;
        mod.pressed(true);
    }
}
