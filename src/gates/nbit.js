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
                "Split" + (i + 1),
                1,
                i,
                [...array].fill(State.highZ)
            );
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
        // console.log('ttt', this);
        // console.log(circuit);
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
    render() {
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
        super.render();
    }
    released() {
        super.released();
    }
    static add(splitArray = [[0], [1]]) {
        currentCircuit.addModule(new Splitter("Splitter", splitArray));
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
    /*
    selectedObject.inputNode.value = State.changeWidth(
        selectedObject.inputNode.value,
        width
    );
    console.log("AAAAAAAA", splitArray);
    selectedObject.setSplitter(splitArray);
    */
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
    render() {
        super.render(this.outputValue, 12, 0, 0, "basic/input");
    }
    released() {
        super.released();
    }
    selected() {
        super.selected();
        document.getElementById("selecting-nbitinput").style.display = "flex";
    }
    static add() {
        let mod = new NBitInput("N-bit Input");
        currentCircuit.addInputModule(mod);
    }
}

function setNBitInput(time) {
    let value = document.getElementById("selecting-nbitinput-value").value;
    selectedObject.setInput(State.fromString(value), time);
    currentCircuit.evaluateAll(false);
}

class BitwiseNotGate extends Module {
    constructor(name) {
        super(name, 3, 2);
        this.inputs = [new InputNode(this, "Input", 0, 1)];
        this.outputs = [new OutputNode(this, "Output", 3, 1)];
        this.displayName = "NOT";
    }
    render() {
        super.render();
        // super.render(this.displayName, 8, -8, 0, "basic/not");
    }
    evaluate(time) {
        super.evaluate(time);
        let result = this.inputs[0].getValue(time).map((x) => State.not(x));
        this.outputs[0].setValues(
            result,
            time + this.outputs[0].delay,
            false,
            true
        );
    }
    static add() {
        currentCircuit.addModule(new BitwiseNotGate("Bitwise NOT Gate"));
    }
}

class BitwiseAndGate extends Module {
    constructor(name) {
        super(name, 4, 3);
        this.inputs = [
            new InputNode(this, "Input 1", 0, 0),
            new InputNode(this, "Input 2", 0, 2),
        ];
        this.outputs = [new OutputNode(this, "Output", 4, 1)];
        this.displayName = "AND";
    }
    render() {
        /*
        super.render(
            this.displayName,
            12,
            -5,
            -10,
            "basic/and",
            0,
            -20,
            80,
            80
        );
        */
        super.render();
    }
    evaluate(time) {
        super.evaluate(time);
        let input1 = this.inputs[0].getValue(time);
        let input2 = this.inputs[1].getValue(time);
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
        currentCircuit.addModule(new BitwiseAndGate("Bitwise AND Gate"));
    }
}
