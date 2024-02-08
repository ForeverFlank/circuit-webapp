class Splitter extends Module {
    constructor(name) {
        super(name, 1, 2);
        this.inputNode = new SplitterNode(this, "Input", 0, 0, [
            State.highZ,
            State.highZ,
        ]);
        this.inputs = [this.inputNode];
        this.outputs = [];
        this.splitArray = [[0], [1]];
        this.setSplitter(this.splitArray);
        this.displayName = "";
    }
    setSplitter(splitArray = this.splitArray) {
        function splitArrayLength(array) {
            return array
                .map((arr) => arr.length)
                .reduce((sum, a) => sum + a, 0);
        }

        let newWidth = splitArrayLength(splitArray);
        if (newWidth > splitArrayLength(this.splitArray)) {
            let maxIndex = Math.max(splitArray.flat());
            splitArray.concat(
                Array(newWidth - maxIndex - 1).fill(maxIndex + 1).map((x, y) => x + y)
            );
        }
        this.splitArray = splitArray;
        console.log('AAAA', splitArray)
        this.inputNode.indices = Array(newWidth)
            .fill(0)
            .map((x, y) => x + y);
        for (let i in this.inputs) {
            if (i == 0) continue;
            this.inputs[i].disconnectAll();
        }
        this.inputs = [this.inputNode];
        let i = 0;
        splitArray.forEach((array) => {
            let newNode = new SplitterNode(
                this,
                "Split" + (i + 1),
                1,
                i,
                Array(array.length).fill(State.highZ)
            );
            newNode.indices = array;
            this.inputs.push(newNode);
            this.inputNode.connect(newNode);
            console.log(newNode)
            i++;
        });
        this.inputs.forEach((node) => {
            node.connections.forEach((wire) => {
                if (wire.destination.isSplitter) {
                    wire.rendered = false;
                }
            })
        })
    }
    getSplitArrayString() {
        return this.splitArray.map((arr) => {
            if (arr.length == 1) return arr[0].toString();
            return Math.min(...arr) + ':' + Math.max(...arr)
        }).join(' ');
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
    selectedObject.inputNode.value = State.changeWidth(
        selectedObject.inputNode.value,
        width
    );
    console.log('AAAAAAAA', splitArray)
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
