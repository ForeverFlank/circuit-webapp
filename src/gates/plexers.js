import { Module, WireNode } from "../classes/module.js";
import { ModuleNode, InputNode, OutputNode, SplitterNode } from "../classes/modulenode.js";
import { State } from "../classes/state.js";

class Decoder1To2 extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 2;
        if (obj.height == null) obj.height = 3;
        super(obj);
        this.inputs = [new InputNode(this, "A0", 0, 1)];
        this.outputs = [
            new OutputNode(this, "D0", 2, 1),
            new OutputNode(this, "D1", 2, 2),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "";
    }
    evaluate(time) {
        super.evaluate(time);
        let a0 = this.inputs[0].getValueAtTime(time)[0];
        for (let i = 0; i < 2; i++) {
            let x0 = (i >> 0) & 1 ? a0 : State.not(a0);
            this.outputs[i].setValue(
                State.and([x0]),
                0,
                time + this.outputs[i].delay,
                false,
                true
            );
        }
    }
    static add() {
        Module.addToCircuit(new Decoder1To2({ name: "1-to-2 Decoder" }));
    }
}

class Decoder2To4 extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 2;
        if (obj.height == null) obj.height = 5;
        super(obj);
        this.inputs = [
            new InputNode(this, "A0", 0, 1),
            new InputNode(this, "A1", 0, 2),
        ];
        this.outputs = [
            new OutputNode(this, "D0", 2, 1),
            new OutputNode(this, "D1", 2, 2),
            new OutputNode(this, "D2", 2, 3),
            new OutputNode(this, "D3", 2, 4),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "";
    }
    evaluate(time) {
        super.evaluate(time);
        let a0 = this.inputs[0].getValueAtTime(time)[0];
        let a1 = this.inputs[1].getValueAtTime(time)[0];
        for (let i = 0; i < 4; i++) {
            let x0 = (i >> 0) & 1 ? a0 : State.not(a0);
            let x1 = (i >> 1) & 1 ? a1 : State.not(a1);
            this.outputs[i].setValue(
                State.and([x0, x1]),
                0,
                time + this.outputs[i].delay,
                false,
                true
            );
        }
    }
    static add() {
        Module.addToCircuit(new Decoder2To4({ name: "2-to-4 Decoder" }));
    }
}

class Decoder3To8 extends Module {
    constructor(obj) {
        if (obj.width == null) obj.width = 2;
        if (obj.height == null) obj.height = 9;
        super(obj);
        this.inputs = [
            new InputNode(this, "A0", 0, 1),
            new InputNode(this, "A1", 0, 2),
            new InputNode(this, "A2", 0, 3),
        ];
        this.outputs = [
            new OutputNode(this, "D0", 2, 1),
            new OutputNode(this, "D1", 2, 2),
            new OutputNode(this, "D2", 2, 3),
            new OutputNode(this, "D3", 2, 4),
            new OutputNode(this, "D4", 2, 5),
            new OutputNode(this, "D5", 2, 6),
            new OutputNode(this, "D6", 2, 7),
            new OutputNode(this, "D7", 2, 8),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "";
    }
    evaluate(time) {
        super.evaluate(time);
        let a0 = this.inputs[0].getValueAtTime(time)[0];
        let a1 = this.inputs[1].getValueAtTime(time)[0];
        let a2 = this.inputs[2].getValueAtTime(time)[0];
        for (let i = 0; i < 8; i++) {
            let x0 = (i >> 0) & 1 ? a0 : State.not(a0);
            let x1 = (i >> 1) & 1 ? a1 : State.not(a1);
            let x2 = (i >> 2) & 1 ? a2 : State.not(a2);
            this.outputs[i].setValue(
                State.and([x0, x1, x2]),
                0,
                time + this.outputs[i].delay,
                false,
                true
            );
        }
    }
    static add() {
        Module.addToCircuit(new Decoder3To8({ name: "3-to-8 Decoder" }));
    }
}

export { Decoder1To2, Decoder2To4, Decoder3To8 }