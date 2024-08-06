import { Module, WireNode } from "../classes/module.js";
import { ModuleNode, InputNode, OutputNode, SplitterNode } from "../classes/modulenode.js";
import { State } from "../classes/state.js";

class LED extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 2;
        if (obj.height == null) obj.height = 2;
        super(obj);
        this.inputValue = [State.highZ];
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
        this.inputs.forEach((node) => (node.pinDirection = 0));
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(obj) {
        if (this.isHiddenOnAdd) return;
        super.render(obj);
        /*
        push();
        stroke(0);
        strokeWeight(2);
        let value = this.inputs[0].getValueAtTime(Infinity)[0];
        let color = value == State.high ? "#e83115" : "#610605";
        fill(color);
        circle(this.x + 20, this.y + 20, 28);
        pop();
        */
        // let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        // super.render(graphics, [[char, 12, 0, 0]], "basic/output");
    }
    static add() {
        Module.addToCircuit(new LED({ name: "LED" }));
    }
}

class Display7Segment extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 2;
        if (obj.height == null) obj.height = 2;
        super(obj);
        this.inputValue = [State.highZ];
        this.inputs = [new InputNode(this, "Input", 0, 1, [State.highZ])];
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(graphics) {
        // let char = State.toString(this.inputs[0].getValueAtTime(Infinity));
        // super.render(graphics, [[char, 12, 0, 0]], "basic/output");
    }
    static add() {
        let mod = new Display7Segment({ name: "7 Segment Display" });
        currentCircuit.addOutputModule(mod);
        mod.ignoreDiv = true;
        mod.pressed(true);
    }
}

export { LED, Display7Segment }