class Splitter extends Module {
    constructor(name) {
        super(name, 1, 2);
        this.inputs = [
            new InputNode(this, "Input", 0, 0,
                [State.highZ, State.highZ]),
            new InputNode(this, "Split 1", 1, 0),
            new InputNode(this, "Split 2", 1, 1),];
        this.outputs = [];
        this.splitArray = [[0], [1]];
        this.displayName = "";
    }
    setSplitter(split) {

    }
    evaluate(time) {
        super.evaluate(time);
        /*
        let inputValue = this.inputs[0].value;
        let splitValues = this.inputs.slice(1).map((x) => x.value);
        let value = [];
        console.log('!!! SPLIT !!!')
        console.log(splitValues)
        for (let i in this.splitArray) {
            for (let j in this.splitArray[i]) {
                let index = this.splitArray[i][j];
                value[index] = splitValues[i][j];
            }
        }
        console.log(value)
        this.inputs[0].setValues(
            value,
            time,
            false,
            true
        );
        */
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
    let width = document.getElementById("selecting-bitwidth").value;
    let splitString = document.getElementById("selecting-bitsplit").value;
    let splitArray = splitString.split(" ");
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
    selectedObject.setSplitter(splitArray);
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
        super.render(this.outputValue, 12, -5, 0, "basic/input");
    }
    released() {
        super.released();
    }
    static add() {
        let module = new NBitInput("N-bit Input");
        circuit.addInputModule(module);
    }
}

function setNBitInput(time) {
    let value = document.getElementById("selecting-nbitinput-value").value;
    selectedObject.setInput(State.fromString(value), time);
    circuit.evaluateAll(false);
}