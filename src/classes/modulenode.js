class ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ],
        delay = 0,
        pinDirection = -1
    ) {
        this.owner = owner;
        this.name = name;
        this.id = unique(name);
        this.delay = delay;
        this.valueAtTime = { 0: value };
        this.isHighZAtTime = { 0: value.map((x) => x == State.highZ) };
        this.connections = [];
        this.objectType = "node";
        this.nodeType = "node";
        this.isSplitter = false;
        this.isSplitterInput = false;
        this.relativeX = relativeX;
        this.relativeY = relativeY;
        this.isDragging = false;
        this.isHovering = false;
        this.linkedModule = null;
        this.pinDirection = pinDirection;
    }
    getPosition() {
        return [
            this.relativeX + this.owner.x / 20,
            this.relativeY + this.owner.y / 20,
        ];
    }
    isConnected() {
        return this.connections.length > 0;
    }
    getValueAtTime(time) {
        if (time == null) return this.value;
        let result = this.valueAtTime[time];
        if (result == null) {
            for (let key in this.valueAtTime) {
                if (Number(key) < time) {
                    result = this.valueAtTime[key];
                }
            }
        }
        return result;
    }
    setValueAtTime(time, value) {
        this.valueAtTime[time] = value;
    }
    setValueAtIndexAtTime(time, index, value) {
        let newValue = [...this.getValueAtTime(time)];
        newValue[index] = value;
        this.valueAtTime[time] = newValue;
    }
    getHighZAtTime(time) {
        // console.log('f', this.isHighZAtTime)
        if (time == null) return this.isHighZAtTime;
        let result = this.isHighZAtTime[time];
        if (result == null) {
            for (let key in this.isHighZAtTime) {
                if (Number(key) < time) {
                    result = this.isHighZAtTime[key];
                }
            }
        }
        return result;
    }
    setHighZAtIndexAtTime(time, index, value) {
        console.log(time, index, value)
        let newValue = [...this.getHighZAtTime(time)];
        newValue[index] = value;
        this.isHighZAtTime[time] = newValue;
    }
    connectedToOutput(initIndex = 0, time) {
        function currentItemToString(index, nodeId) {
            return `i${index}n${nodeId}`;
        }
        let stack = [];
        let traversed = new Set();
        let marked = new Set();
        stack.push([initIndex, this]);
        let isConnectedToOutput = false;
        let activeOutputsCount = 0;
        while (stack.length > 0) {
            let [index, currentNode] = stack.pop();
            index = parseInt(index);
            // console.log(";;", index, currentNode.name);
            if (!traversed.has(currentItemToString(index, currentNode.id))) {
                traversed.add(currentItemToString(index, currentNode.id));
                currentNode.connections.forEach((wire) => {
                    let destinationNode = wire.destination;
                    if (wire.isSplitterConnection()) {
                        let newIndex = destinationNode.indices.indexOf(
                            index + Math.min(...currentNode.indices)
                        );
                        if (newIndex != -1) {
                            stack.push([newIndex, destinationNode]);
                        }
                        return;
                    }

                    if (destinationNode.isOutputNode()) {
                        isConnectedToOutput ||= true;
                        let isDestinationHighZ =
                            destinationNode.getHighZAtTime(time)[index];
                        console.log(isDestinationHighZ)
                        if (
                            !isDestinationHighZ &&
                            !marked.has(destinationNode.id)
                        ) {
                            activeOutputsCount++;
                            marked.add(destinationNode.id);
                        }
                    }
                    stack.push([index, destinationNode]);
                });
            }
        }

        
        console.log(
            '>>',
            this.name,
            initIndex,
            ">>",
            isConnectedToOutput,
            activeOutputsCount
        );
        
        return {
            isConnectedToOutput: isConnectedToOutput,
            activeOutputsCount: activeOutputsCount,
        };
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
            "----",
            this.id,
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
            let isValueHighZ = value == State.highZ;
            console.log(isValueHighZ)
            this.setHighZAtIndexAtTime(time, index, isValueHighZ);
            if (
                !isValueHighZ ||
                this.connectedToOutput(index, time).activeOutputsCount == 0
            ) {
            }
        }

        /*
        let newValue = [...this.value];
        newValue[index] = value;
        this.valueAtTime[time] = this.value = newValue;
        */
       this.setValueAtIndexAtTime(time, index, value);

        console.log("it is now " + this.valueAtTime[time] + " " + this.isHighZAtTime[time]);
        // console.log(traversed);
        function currentItemToString(index, nodeId) {
            return `i${index}n${nodeId}`;
        }
        this.connections.forEach((wire) => {
            let destinationNode = wire.destination;
            let isNodeHighZ = this.getHighZAtTime(time)[index];
            let isValueHighZ = this.getValueAtTime(time)[index] == State.highZ;
            if (!isNodeHighZ || !isValueHighZ) {
                if (wire.isSplitterConnection()) {
                    let destIndex = destinationNode.indices.indexOf(
                        index + Math.min(...this.indices)
                    );
                    if (
                        traversed.has(
                            currentItemToString(destIndex, destinationNode.id)
                        )
                    ) {
                        return;
                    }
                    // console.log("dest indices", dest.indices, "this indices", this.indices);
                    // console.log(this.name, "index", index, "->", destIndex);
                    if (destIndex != -1) {
                        destinationNode.setValue(
                            value,
                            destIndex,
                            time,
                            false,
                            false,
                            inputDelay,
                            traversed.add(currentItemToString(index, this.id))
                        );
                    }
                } else {
                    if (
                        traversed.has(
                            currentItemToString(index, destinationNode.id)
                        )
                    )
                        return;
                    destinationNode.setValue(
                        value,
                        index,
                        time,
                        false,
                        false,
                        inputDelay,
                        traversed.add(currentItemToString(index, this.id))
                    );
                }
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
            // console.log("g", x);
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
    connect(node, evaluate = true) {
        if (this.id == node.id) return;
        if (
            this.connections.some(
                (wire) =>
                    (wire.source.id == this.id &&
                        wire.destination.id == node.id) ||
                    (wire.source.id == node.id &&
                        wire.destination.id == this.id)
            )
        )
            return;
        let outgoingWire = new Wire(this, node);
        let incomingWire = new Wire(node, this, false);
        this.connections.push(outgoingWire);
        node.connections.push(incomingWire);

        if (evaluate) {
            currentCircuit.evaluateAll();
        }

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
    disconnect(node, evaluate = true) {
        let [incomingWire, outgoingWire] = this.getWire(node);

        node.connections = node.connections.filter((x) => x != incomingWire);

        this.connections = this.connections.filter((x) => x != outgoingWire);

        if (
            node.connections.length == 0 &&
            node.isGenericNode() &&
            !node.isSplitterNode()
        ) {
            currentCircuit.removeModule(node.owner);
        }
        if (
            this.connections.length == 0 &&
            this.isGenericNode() &&
            !this.isSplitterNode()
        ) {
            currentCircuit.removeModule(this.owner);
        }

        if (evaluate) {
            currentCircuit.evaluateAll();
        }
    }
    disconnectAll(disconnectSplitter = false) {
        this.connections.forEach((x) => {
            if (!x.destination.isSplitterNode() && !disconnectSplitter) {
                x.source.disconnect(x.destination);
            }
        });
    }
    connectByGrid() {
        let nodes = currentCircuit.getNodes(false);
        if (!this.isGenericNode()) {
            nodes = nodes.filter((node) => node.isGenericNode());
        }
        // console.log(this, nodes)
        let targetNode = nodes.find(
            (node) =>
                node.id != this.id &&
                node.getCanvasX() == this.getCanvasX() &&
                node.getCanvasY() == this.getCanvasY()
        );
        if (targetNode != null) {
            this.connect(targetNode);
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
        }
        let value =
            this.valueAtTime[Math.max(...Object.keys(this.valueAtTime))];
        noStroke();
        if (value.length == 1) {
            fill(State.color(value[0]));
        } else {
            if (value.every((x) => x == State.highZ)) {
                fill(State.color(State.highZ));
            } else {
                fill(64);
            }
        }
        circle(netX, netY, this.hovering() ? 9 : 6);

        if (this.hovering()) {
            hoveringNode = this;
        }
        if (DEBUG) {
            push();
            textSize(5);
            // text(this.isHighZ, netX, netY - 22);
            text(this.id.slice(0, 10), netX, netY + 8);
            noStroke();
            fill(0);

            if (this.isSplitterNode()) text(this.indices, netX, netY - 8);
            let str = typeof value == "object" ? ": " : "";
            text(str + value, netX, netY - 13);
            // text(this.isHighZ, netX, netY - 18);
            // text("; " + this.valueAtTime, netX, netY - 23);
            /*
            text(
                this.connections.map((x) => x.destination.name),
                netX + 16,
                netY - 16
            );
            */
            // text(this.delay, netX + 5, netY - 15);
            if (this.isSplitterNode()) text(this.indices, netX + 16, netY - 26);
            pop();
        }
    }
    renderPin() {
        let netX = this.getCanvasX();
        let netY = this.getCanvasY();
        push();
        stroke(0);
        strokeWeight(2);
        if (this.pinDirection == 0) line(netX, netY, netX + 10, netY);
        if (this.pinDirection == 1) line(netX, netY, netX, netY - 10);
        if (this.pinDirection == 2) line(netX, netY, netX - 10, netY);
        if (this.pinDirection == 3) line(netX, netY, netX, netY + 10);
        pop();
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
                this.remove();
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
    remove() {
        this.disconnectAll();
    }
    isGenericNode() {
        return this.nodeType == "node";
    }
    isInputNode() {
        return this.nodeType == "input";
    }
    isOutputNode() {
        return this.nodeType == "output";
    }
    isSplitterNode() {
        return this.isSplitter;
    }
    addWireNode() {
        let x = Math.round(mouseCanvasX / 20) * 20;
        let y = Math.round(mouseCanvasY / 20) * 20;
        let value = [...this.getValueAtTime(0)].fill(State.highZ);
        let destinationNode = WireNode.add(x, y, value, false);
        clickedNode.connect(destinationNode.inputs[0]);
        clickedNode = null;
        return destinationNode;
    }
    linkModule(mod) {
        this.linkedModule = mod;
        mod.linkedNode = this;
    }
    serialize() {
        return {
            ownerId: this.owner.id,
            name: this.name,
            id: this.id,
            objectType: this.objectType,
            value: this.value,
            delay: this.delay,
            isHighZ: this.isHighZ,
            connectionsId: this.connections.map((wire) => wire.id),
            nodeType: this.nodeType,
            isSplitter: this.isSplitter,
            isSplitterInput: this.isSplitterInput,
            relativeX: this.relativeX,
            relativeY: this.relativeY,
        };
    }
    fromSerialized(data, owner, connections) {
        this.name = data.name;
        this.id = data.id;
        this.objectType = data.objectType;
        this.value = data.value;
        this.delay = data.delay;
        this.isHighZ = data.isHighZ;
        this.nodeType = data.nodeType;
        this.isSplitter = data.isSplitter;
        this.isSplitterInput = data.isSplitterInput;
        this.relativeX = data.relativeX;
        this.relativeY = data.relativeY;
        this.ownerId = data.ownerId;
        this.connectionsId = data.connectionsId;
        // this.owner = owner;
        // this.connections = connections;
    }
}

class InputNode extends ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ],
        delay = 0,
        pinDirection = -1
    ) {
        super(owner, name, relativeX, relativeY, value, delay, pinDirection);
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
        delay = 1,
        pinDirection = -1
    ) {
        super(owner, name, relativeX, relativeY, value, delay, pinDirection);
        this.nodeType = "output";
    }
}

class SplitterNode extends ModuleNode {
    constructor(
        owner,
        name,
        relativeX = 0,
        relativeY = 0,
        value = [State.highZ],
        delay = 0,
        pinDirection = -1
    ) {
        super(owner, name, relativeX, relativeY, value, delay, pinDirection);
        this.nodeType = "node";
        this.isSplitter = true;
        this.indices = [];
    }
}
