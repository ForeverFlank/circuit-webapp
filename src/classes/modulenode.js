class ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ],
        delay = 0
    ) {
        this.owner = owner;
        this.name = name;
        this.id = unique(name);
        this.value = value;
        this.delay = delay;
        this.totalDelay = [];
        this.valueAtTime = { 0: value };
        // this.isHighZ = (value == State.highZ);
        this.isHighZ = Object.entries(value).map((x) => x[1] == State.highZ);
        this.connections = [];
        this.nodeType = "node";
        this.isSplitter = false;
        this.relativeX = relativeX;
        this.relativeY = relativeY;
        this.isDragging = false;
        this.isHovering = false;
        this.linkedModule = null;
        gridNodeLookup[this.getPosition()] = this;
        // console.log(gridNodeLookup)
    }
    getPosition() {
        return [
            this.relativeX + this.owner.x / 20,
            this.relativeY + this.owner.y / 20,
        ];
    }
    updateGridNodeLookup() {
        gridNodeLookup = Object.fromEntries(
            Object.entries(gridNodeLookup).filter(
                ([key, value]) => value.id != this.id
            )
        );
        gridNodeLookup[this.getPosition()] = this;
    }
    isConnected() {
        return this.connections.length > 0;
    }
    connectedToOutput(index = 0) {
        let stack = [];
        let traversed = new Set();
        let marked = new Set();
        stack.push(this);
        let isConnectedToOutput = false;
        let outputsCount = 0;
        while (stack.length > 0) {
            let src = stack.pop();
            if (!traversed.has(src.id)) {
                traversed.add(src.id);
                src.connections.forEach((wire) => {
                    let dest = wire.destination;
                    stack.push(dest);
                    if (dest.nodeType == "output") {
                        isConnectedToOutput ||= true;
                        if (!dest.isHighZ[index] && !marked.has(dest.id)) {
                            outputsCount++;
                            marked.add(dest.id);
                        }
                    }
                });
            }
        }
        // console.log(isConnectedToOutput, outputsCount)
        return {
            isConnectedToOutput: isConnectedToOutput,
            outputsCount: outputsCount,
        };
    }
    getValue(time) {
        if (time == null) return this.value;
        let result = this.valueAtTime[time];
        if (result == null) {
            let keys = Object.keys(this.valueAtTime)
                .map((x) => parseFloat(x))
                .sort();
            let maxKey = keys[keys.length - 1];
            if (time > maxKey) {
                return this.valueAtTime[maxKey];
            }
            for (let i in keys) {
                if (keys[i] > time) {
                    let lastTime = keys[i - 1];
                    return this.valueAtTime[lastTime];
                }
            }
        }
        return result;
    }
    setValue(
        value,
        index,
        time,
        evaluate = true,
        setByModule = false,
        inputDelay = 0,
        traversed = new Set()
    ) {
        console.log(
            this.owner.name,
            "->",
            this.name,
            "set",
            value,
            evaluate,
            setByModule,
            "to index",
            index,
            "at time",
            time
        );

        if (setByModule) {
            this.isHighZ[index] = value == State.highZ;
            if (
                !this.isHighZ[index] ||
                this.connectedToOutput(index).outputsCount == 0
            ) {
                let newValue = [...this.value];
                newValue[index] = value;
                this.value = newValue;
            }
        } else {
            let newValue = [...this.value];
            newValue[index] = value;
            this.value = newValue;
        }

        this.valueAtTime[time] = this.value;

        console.log(
            "a",
            Object.entries(this.valueAtTime)
                .map((x) => x[0] + ":" + x[1])
                .join(" ")
        );

        if (evaluate) {
            // this.owner.evaluate(time);
        }
        if (this.owner.name == "Output") {
            console.log("oooo");
            this.owner.inputValue = value;
            if (this.owner.linkedNode != null) {
                console.log("hit out");
                this.owner.linkedNode.setValue(value, index, time);
            }
        }
        if (this.linkedModule != null) {
            if (this.linkedModule.name == "Input") {
                console.log("hit in");
                this.linkedModule.setInput(value, time);
            }
        }
        console.log("it is now", this.value, this.valueAtTime);
        function currentItemToString(index, nodeId) {
            return `i${index}n${nodeId}`;
        }
        this.connections.forEach((wire) => {
            let dest = wire.destination;
            if (traversed.has(currentItemToString(index, dest.id))) return;
            if (!this.isHighZ[index] || this.value[index] != State.highZ) {
                if (this.isSplitter && dest.isSplitter) {
                    let destIndex = dest.indices.indexOf(
                        index + Math.min(...this.indices)
                    );

                    console.log(this.name, "index", index, "->", destIndex);
                    if (destIndex != -1) {
                        dest.setValue(
                            this.value[index],
                            destIndex,
                            time,
                            false,
                            false,
                            inputDelay,
                            traversed.add(currentItemToString(destIndex, this.id))
                        );
                    }
                } else {
                    dest.setValue(
                        this.value[index],
                        index,
                        time,
                        false,
                        false,
                        inputDelay,
                        traversed.add(currentItemToString(index, this.id))
                    );
                }
            }
            if (dest.nodeType != "output") {
                // dest.owner.evaluate();
            }
        });
    }
    setValues(
        value,
        time,
        evaluate = true,
        setByModule = false,
        inputDelay = 0,
        changeWidth = false
    ) {
        if (changeWidth) {
            this.value = this.value.slice(0, value.length);
        }
        Object.entries(value).forEach((x) => {
            console.log("g", x);
            let index = parseInt(x[0]);
            this.setValue(x[1], index, time, evaluate, setByModule, inputDelay);
        });
    }
    getCanvasX() {
        return this.owner.x + this.relativeX * 20;
    }
    getCanvasY() {
        return this.owner.y + this.relativeY * 20;
    }
    connect(node) {
        if (this.id == node.id) return;
        if (this.connections.indexOf(new Wire(this, node)) >= 0) return;
        let outgoingWire = new Wire(this, node);
        let incomingWire = new Wire(node, this, false);
        this.connections.push(outgoingWire);
        node.connections.push(incomingWire);

        circuit.evaluateAll();

        return [incomingWire, outgoingWire];
    }
    getWire(node) {
        let incomingWire = node.connections.find(
            (x) => x.source.id == node.id && x.destination.id == this.id
        );

        let outgoingWire = this.connections.find(
            (x) => x.source.id == this.id && x.destination.id == node.id
        );

        return [incomingWire, outgoingWire];
    }
    disconnect(node) {
        let [incomingWire, outgoingWire] = this.getWire(node);
        // wire = node.connections.find((x) => (
        //     x.source.id == node.id &&
        //     x.destination.id == this.id));
        node.connections = node.connections.filter((x) => x != incomingWire);

        // wire = this.connections.find((x) => (
        //     x.source.id == this.id &&
        //     x.destination.id == node.id));
        this.connections = this.connections.filter((x) => x != outgoingWire);

        // node.owner.evaluate();
        // this.owner.evaluate();
        circuit.evaluateAll();

        if (node.connections.length == 0 && node.nodeType == "node")
            circuit.removeModule(node.owner);
        if (this.connections.length == 0 && this.nodeType == "node")
            circuit.removeModule(this.owner);
    }
    disconnectAll() {
        this.connections.forEach((x) => {
            x.source.disconnect(x.destination);
        });
    }
    connectByGrid() {
        let thisNode = this;
        let otherNode = gridNodeLookup[thisNode.getPosition()];
        // console.log('w', otherNode)
        if (otherNode != null && otherNode.owner.id != thisNode.owner.id) {
            // console.log('aa')
            // console.log(thisNode, 'found', otherNode);
            if (thisNode.nodeType != "node" && otherNode.nodeType != "node")
                return;
            if (otherNode.nodeType == "node") {
                [thisNode, otherNode] = [otherNode, thisNode];
            }
            thisNode.connections.forEach((wire) => {
                let destination = wire.destination;
                circuit.removeModule(thisNode.owner);
                otherNode.connect(destination);
                // console.log('replaced')
            });
        }
    }
    hovering() {
        if (controlMode == "pan") return false;
        if (hoveringOnDiv()) return false;
        let result =
            (mouseCanvasX - this.getCanvasX()) ** 2 +
                (mouseCanvasY - this.getCanvasY()) ** 2 <=
            NODE_HOVERING_RADIUS ** 2;
        return result;
    }
    render() {
        stroke(0);
        strokeWeight(2);
        let netX = this.getCanvasX();
        let netY = this.getCanvasY();
        if (this.isDragging) {
            line(netX, netY, mouseCanvasX, mouseCanvasY);
        } else if (this.isDragging) {
        } else {
        }

        // console.log(this.value)
        noStroke();
        fill(State.color(this.value[0]));
        circle(netX, netY, this.hovering() ? 9 : 6);

        if (this.hovering()) {
            hoveringNode = this;
        }
        if (DEBUG) {
            push();
            // text(this.isHighZ, netX, netY - 22);
            text(this.id.slice(0, 10), netX, netY - 7);
            noStroke();
            fill(0);
            textSize(15);
            text(
                this.connections.map((x) => x.destination.name),
                netX + 5,
                netY + 35
            );
            textSize(9);
            if (this.isSplitter) text(this.indices, netX, netY - 16);
            // let str = typeof this.value == "object" ? "obj: " : "";
            // text(str + this.value, netX, netY - 16);
            // text(this.delay, netX + 5, netY - 15);
            // text(this.totalDelay, netX + 5, netY + 15);

            pop();
        }
    }
    pressed() {
        this.isHovering = this.hovering();
        if (this.isHovering && pressedObject.id == 0) {
            pressedObject = this;
            if (mouseButton == LEFT) {
                line(
                    this.getCanvasX(),
                    this.getCanvasY(),
                    mouseCanvasX,
                    mouseCanvasY
                );
                clickedNode = this;
                this.isDragging = true;
                return true;
            }
            if (mouseButton == RIGHT) {
                this.disconnectAll();
            }
        }
        return false;
    }
    released() {
        this.isDragging = false;
        if (this.isHovering) {
            if (clickedNode != null) {
                clickedNode.connect(this);
                clickedNode = null;
                return true;
            }
        }
        this.isHovering = false;
    }
    addWireNode() {
        let x = Math.round(mouseCanvasX / 20) * 20;
        let y = Math.round(mouseCanvasY / 20) * 20;
        let dest = WireNode.add(x, y);
        clickedNode.connect(dest.inputs[0]);
        clickedNode = null;
        return dest;
    }
    linkModule(module) {
        this.linkedModule = module;
        module.linkedNode = this;
    }
}

class InputNode extends ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ]
    ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = "input";
    }
}

class OutputNode extends ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ],
        delay = 1
    ) {
        super(owner, name, relativeX, relativeY, value, delay);
        this.nodeType = "output";
    }
}

// todo; use splitter as  a separated separator and combiner instead
class SplitterNode extends ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ]
    ) {
        super(owner, name, relativeX, relativeY, value, 0);
        this.nodeType = "node";
        this.isSplitter = true;
        this.indices = [];
    }
}
