class Splitter extends Module {
    constructor(name, splitArray = [[0], [1]]) {
        function splitArrayLength(array) {
            return array
                .map((arr) => arr.length)
                .reduce((sum, a) => sum + a, 0);
        }
        let width = splitArrayLength(splitArray);

        super(name, 1, width);
        this.outputs = [];
        this.splitArray = splitArray;
        this.displayName = "";

        this.inputNode = new SplitterNode(
            this,
            "Splitter Input",
            0,
            0,
            Array(width).fill(State.highZ)
        );
        this.inputNode.pinDirection = 0;
        this.inputs = [this.inputNode];

        this.splitArray = splitArray;

        this.inputNode.indices = Array(width)
            .fill(0)
            .map((x, y) => x + y);
        for (let i in this.inputs) {
            if (i == 0) continue;
            this.inputs[i].disconnectAll();
        }
        this.inputNode.isSplitterInput = true;

        // this.inputNode.value = State.changeWidth(this.inputNode.value, width);

        this.inputs = [this.inputNode];
        let i = 0;

        [...splitArray].forEach((array) => {
            let newNode = new SplitterNode(
                this,
                "Split " + (i + 1),
                1,
                i,
                [...array].fill(State.highZ)
            );
            newNode.pinDirection = 2;
            newNode.indices = array;
            this.inputs.push(newNode);
            let [wire1, wire2] = this.inputNode.connect(newNode);
            wire1.rendered = wire2.rendered = false;
            console.log(newNode);
            i++;
        });
        this.inputNode.connections.forEach((wire) => {
            if (wire.isSplitterConnection()) {
                wire.rendered = false;
            }
        });
    }
    getSplitArrayString() {
        return this.splitArray
            .map((arr) => {
                if (arr.length == 1) return arr[0].toString();
                return Math.min(...arr) + ":" + Math.max(...arr);
            })
            .join(" ");
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(graphics) {
        push();
        noFill();
        stroke(0);
        strokeWeight(6);
        strokeCap(PROJECT);
        line(
            this.x + 10,
            this.y,
            this.x + 10,
            this.y + this.splitArray.length * 20 - 20
        );
        pop();
        // super.render(graphics, );
    }
    released() {
        super.released();
    }
    static add(splitArray = [[0], [1]]) {
        let mod = new Splitter("Splitter", splitArray);
        currentCircuit.addModule(mod);
    }
}

function openSplitterMenu() {
    let html = `
    <div class="flex flex-col gap-y-2">
        <p class="text-zinc-600 text-sm">Bit Split</p>
        <input id="modal-add-bitsplit" class="border p-2 h-8 w-full rounded-sm focus-outline text-sm text-zinc-600"
      type="text" placeholder="0 1 2 3 4:7" />
    </div>
    <div class="flex flex-row justify-end w-full gap-x-2">
        <button id="modal-cancel" class="bg-white w-20 h-8 text-sm rounded border border-zinc-200" onclick="closeModalMenu()">Cancel</button>
        <button id="modal-submit" class="bg-blue-500 w-20 h-8 text-sm text-white rounded" onclick="addSplitter()">OK</button>
    </div>`;
    openModalMenu("Add Splitter", html);
}

function splitStringToSplitArray(string) {
    string = string.replace(/\s+/g, " ").trim();
    let splitArray = string.split(" ");

    splitArray = splitArray.map((x) => {
        if (x.includes(":")) {
            let range = x.split(":").map((y) => parseInt(y));
            // bloat
            let min = range[0] < range[1] ? range[0] : range[1];
            let max = range[0] > range[1] ? range[0] : range[1];
            let length = max - min + 1;
            return Array(length)
                .fill(min)
                .map((x, y) => x + y);
        } else {
            return [parseInt(x)];
        }
    });

    let flattedArray = splitArray.flat();

    if (flattedArray.length == 0) return false;
    if (flattedArray[0] != 0) return false;
    for (let i = 1; i < flattedArray.length; i++) {
        if (flattedArray[i] != flattedArray[i - 1] + 1) {
            return false;
        }
    }
    return splitArray;
}

function addSplitter() {
    let string = document.getElementById("modal-add-bitsplit").value;
    let splitArray = splitStringToSplitArray(string);
    Splitter.add(splitArray);
    closeModalMenu();
}

class NBitInput extends Module {
    constructor(name) {
        super(name, 2, 2);
        this.outputValue = [State.low];
        this.outputs = [
            new OutputNode(this, "Output", 2, 1, this.outputValue, 0),
        ];
        this.isSubmoduleIO = false;
    }
    setInput(value, time = 0) {
        this.outputValue = value;
        this.outputs[0].setValues(this.outputValue, time, true, true, 0, true);
    }
    evaluate(time) {
        super.evaluate(time);
    }
    render(graphics) {
        super.render(graphics, 
            [[State.toString(this.outputValue), 12, 0, 0]],
            "basic/input"
        );
    }
    released() {
        super.released();
    }
    selected() {
        super.selected();
        document.getElementById("selecting-nbitinput").style.display = "flex";
        setNBitInputValue(this.outputValue);
    }
    static add() {
        Module.addToCircuit(new NBitInput("N-bit Input"));
    }
}

function setNBitInput(time) {
    let value = document.getElementById("selecting-nbitinput-value").value;
    value = State.fromString(value);
    selectedObject.setInput(value, time);
    currentCircuit.evaluateAll(false);
}

function setNBitInputValue(value) {
    document.getElementById("selecting-nbitinput-value").value =
        State.toString(value);
}

class BitwiseNotGate extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.inputs = [new InputNode(this, "Input", 0, 1)];
        this.outputs = [new OutputNode(this, "Output", 3, 1)];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "NOT";
    }
    render(graphics) {
        super.render(graphics, );
        // super.render(graphics, this.displayName, 8, -8, 0, "basic/not");
    }
    evaluate(time) {
        super.evaluate(time);
        let result = this.inputs[0]
            .getValueAtTime(time)
            .map((x) => State.not(x));
        this.outputs[0].setValues(
            result,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        Module.addToCircuit(new BitwiseNotGate("Bitwise NOT Gate"));
    }
}

class NBitTriStateBuffer extends Module {
    constructor(name) {
        super(name, 4, 2);
        this.inputs = [
            new InputNode(this, "Input", 0, 1),
            new InputNode(this, "Control", 2, 0),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "";
    }
    render(graphics) {
        super.render(graphics, [["", 12, -8, 0]], "basic/tristatebuffer");
    }
    evaluate(time) {
        // console.warn("EVAL", time);
        // super.evaluate(time);
        let inputs = this.inputs[0].getValueAtTime(time);
        let control = this.inputs[1].getValueAtTime(time)[0];
        inputs.forEach((input, index) => {
            if (control == State.high) {
                this.outputs[0].setValue(
                    input,
                    index,
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
                    index,
                    time + this.outputs[0].delay,
                    false,
                    true
                );
            } else {
                this.outputs[0].setValue(
                    State.err,
                    index,
                    time + this.outputs[0].delay,
                    false,
                    true
                );
            }
        });
        super.evaluate(time + this.outputs[0].delay);
    }
    static add() {
        Module.addToCircuit(new NBitTriStateBuffer("N-bit Tri-State Buffer"));
    }
}

class BitwiseAndGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "AND";
    }
    render(graphics) {
        super.render(graphics, );
    }
    evaluate(time) {
        super.evaluate(time);
        let input1 = this.inputs[0].getValueAtTime(time);
        let input2 = this.inputs[1].getValueAtTime(time);
        let maxWidth = Math.max(input1.length, input2.length);
        for (let i = 0; i < maxWidth; i++) {
            let a = input1[i];
            let b = input2[i];
            if (a == null) a = -1;
            if (b == null) b = -1;

            let result = State.and([a, b]);
            this.outputs[0].setValue(
                result,
                i,
                time + this.outputs[0].delay,
                false,
                true
            );
        }
    }
    static add() {
        Module.addToCircuit(new BitwiseAndGate("Bitwise AND Gate"));
    }
}

class BitwiseOrGate extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 2)];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "OR";
    }
    render(graphics) {
        super.render(graphics, );
    }
    evaluate(time) {
        super.evaluate(time);
        let input1 = this.inputs[0].getValueAtTime(time);
        let input2 = this.inputs[1].getValueAtTime(time);
        let maxWidth = Math.max(input1.length, input2.length);
        for (let i = 0; i < maxWidth; i++) {
            let a = input1[i];
            let b = input2[i];
            if (a == null) a = -1;
            if (b == null) b = -1;

            let result = State.or([a, b]);
            this.outputs[0].setValue(
                result,
                i,
                time + this.outputs[0].delay,
                false,
                true
            );
        }
    }
    static add() {
        Module.addToCircuit(new BitwiseOrGate("Bitwise OR Gate"));
    }
}

class NBitMultiplexer extends Module {
    constructor(name) {
        super(name, 2, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 1),
            new InputNode(this, "Input 2", 0, 2),
            new InputNode(this, "Select", 1, 3),
        ];
        this.outputs = [new OutputNode(this, "Output", 2, 1)];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.inputs[2].pinDirection = 1;
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "";
    }
    render(graphics) {
        super.render(graphics, );
    }
    evaluate(time) {
        super.evaluate(time);
        let input1 = this.inputs[0].getValueAtTime(time);
        let input2 = this.inputs[1].getValueAtTime(time);
        let select = this.inputs[2].getValueAtTime(time)[0];
        let maxWidth = Math.max(input1.length, input2.length);

        let result;
        if (select == State.low) {
            result = input1;
        } else if (select == State.high) {
            result = input2;
        } else {
            result = Array(maxWidth).fill(State.err);
        }
        this.outputs[0].setValues(
            result,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        Module.addToCircuit(new NBitMultiplexer("N-bit Multiplexer"));
    }
}

class NBitAdder extends Module {
    constructor(name) {
        super(name, 4, 4);
        this.inputs = [
            new InputNode(this, "Addend 1", 0, 1),
            new InputNode(this, "Addend 2", 0, 2),
            new InputNode(this, "Carry In", 0, 3),
        ];
        this.outputs = [
            new OutputNode(this, "Result", 4, 1),
            new OutputNode(this, "Carry Out", 4, 2),
        ];
        this.inputs.forEach((node) => (node.pinDirection = 0));
        this.outputs.forEach((node) => (node.pinDirection = 2));
        this.displayName = "Add";
    }
    render(graphics) {
        super.render(graphics, );
    }
    evaluate(time) {
        super.evaluate(time);
        let input1 = this.inputs[0].getValueAtTime(time);
        let input2 = this.inputs[1].getValueAtTime(time);
        let c = this.inputs[2].getValueAtTime(time)[0];
        let maxWidth = Math.max(input1.length, input2.length);
        for (let i = 0; i < maxWidth; i++) {
            let a = input1[i];
            let b = input2[i];
            if (a == null) a = -1;
            if (b == null) b = -1;

            let p = State.xor(a, b);
            let sum = State.xor(p, c);
            c = State.or([State.and([a, b]), State.and([p, c])]);

            this.outputs[0].setValue(
                sum,
                i,
                time + this.outputs[0].delay,
                false,
                true
            );
        }
        this.outputs[1].setValue(
            c,
            0,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        Module.addToCircuit(new NBitAdder("N-bit Adder"));
    }
}

export { NBitInput, BitwiseNotGate, NBitTriStateBuffer, BitwiseAndGate, BitwiseOrGate, NBitMultiplexer, NBitAdder }