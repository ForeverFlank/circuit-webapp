import { Module, WireNode } from "../classes/module.js";
import { ModuleNode, InputNode, OutputNode, SplitterNode } from "../classes/modulenode.js";
import { State } from "../classes/state.js";

class NotGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 2;
        super(obj);
        this.inputs = [new InputNode(this, "Input", 0, 1)];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "NOT";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 10, -6, 0]];
        obj.src = "basic/not";
        super.render(obj);
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
        Module.addToCircuit(new NotGate({ name: "NOT Gate" }));
    }
}

class AndGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "AND";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/and";
        super.render(obj);
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
        Module.addToCircuit(new AndGate({ name: "AND Gate" }));
    }
}

class OrGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "OR";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/or";
        super.render(obj);
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
        Module.addToCircuit(new OrGate({ name: "OR Gate" }));
    }
}

class NandGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "NAND";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/nand";
        super.render(obj);
    }
    render(graphics) {
        super.render(graphics,
            [[this.displayName, 12, -5, 0]],
            "basic/nand",
            0,
            0,
            80,
            80
        );
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
        Module.addToCircuit(new NandGate({ name: "NAND Gate" }));
    }
}

class NorGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "NOR";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/nor";
        super.render(obj);
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
        Module.addToCircuit(new NorGate({ name: "NOR Gate" }));
    }
}

class XorGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "XOR";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/xor";
        super.render(obj);
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
        Module.addToCircuit(new XorGate({ name: "XOR Gate" }));
    }
}

class XnorGate extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.displayName = "XNOR";
    }
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [[this.displayName, 12, -5, 0]];
        obj.src = "basic/xnor";
        super.render(obj);
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
        Module.addToCircuit(new XnorGate({ name: "XNOR Gate" }));
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
    render(obj = {
        container: undefined,
        graphics: undefined
    }) {
        obj.labels = [];
        obj.src = "basic/tristatebuffer";
        super.render(obj);
    }
    evaluate(time) {
        // console.warn("EVAL", time);
        // super.evaluate(time);
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
        } else if (
            control == State.low ||
            (control == State.highZ && input == State.highZ)
        ) {
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
        Module.addToCircuit(new TriStateBuffer({ name: "Tri-State Buffer" }));
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
        Module.addToCircuit(new HalfAdder({ name: "Half Adder" }));
    }
}

class FullAdder extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 4;
        if (obj.height == null) obj.height = 4;
        super(obj);
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
        Module.addToCircuit(new FullAdder({ name: "Full Adder" }));
    }
}

export { NotGate, AndGate, OrGate, NandGate, NorGate, XnorGate, XorGate, TriStateBuffer, HalfAdder, FullAdder }