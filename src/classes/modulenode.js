class ModuleNode {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = State.highZ, delay = 0) {
        this.owner = owner;
        this.name = name;
        this.id = unique(name);
        this.value = value;
        this.delay = delay;
        this.totalDelay = [0];
        this.isHighZ = (value == State.highZ);
        this.connections = [];
        this.nodeType = 'node';
        this.relativeX = relativeX;
        this.relativeY = relativeY;
        this.isDragging = false;
        this.isHovering = false;
        gridNodeLookup[this.getPosition()] = this;
        // console.log(gridNodeLookup)
    }
    getPosition() {
        return [this.relativeX + this.owner.x / 20, this.relativeY + this.owner.y / 20];
    }
    updateGridNodeLookup() {
        gridNodeLookup = Object.fromEntries(
            Object.entries(gridNodeLookup)
                .filter(([key, value]) => value.id != this.id));
        gridNodeLookup[this.getPosition()] = this;
    }
    isConnected() {
        return this.connections.length > 0;
    }
    connectedToOutput() {
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
                    if (dest.nodeType == 'output') {
                        isConnectedToOutput ||= true;
                        if (!dest.isHighZ &&
                            !marked.has(dest.id)) {
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
            outputsCount: outputsCount
        };
    }
    getValue() {
        return this.value;
    }
    setValue(value, evaluate = true, setByModule = false, inputDelay = 0, traversed = new Set()) {
        // todo: set if no other outputs are connected
        // todo: internal value that contains highZ state
        console.log('set ' + this.name + ' to ' + value)
        // if (this.isHighZ && this.nodeType == 'output') return;
        if (setByModule) {
            this.isHighZ = value == State.highZ;
            if (!this.isHighZ || this.connectedToOutput().outputsCount == 0)
                this.value = value;
        }
        else {
            this.value = value;
        }
        if (evaluate) {
            this.owner.evaluate();
        }
        this.connections.forEach((wire) => {
            let dest = wire.destination;
            /*if (!traversed.has(dest.id)) {
                if (!this.isHighZ || this.value != State.highZ) {
                    dest.setValue(this.value, false, false, inputDelay, traversed.add(this.id));
                }
                if (dest.nodeType != 'output') {
                    dest.owner.evaluate();
                }
            }*/
            if (!traversed.has(dest.id)) {
                if (!this.isHighZ || this.value != State.highZ) {
                    dest.setValue(this.value, false, false, inputDelay, traversed.add(this.id));
                }
                if (dest.nodeType != 'output') {
                    // dest.owner.evaluate();
                }
            }
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
        this.connections.push(new Wire(this, node));
        node.connections.push(new Wire(node, this, false));

        /*
        if (node.isHighZ) {
            this.setValue(this.value);
        } else {
            node.setValue(node.value);
        }
        */

        circuit.evaluateAll();
    }
    disconnect(node) {
        let wire;
        wire = node.connections.find((x) => (
            x.source.id == node.id &&
            x.destination.id == this.id));
        node.connections = node.connections.filter(x => x != wire);

        wire = this.connections.find((x) => (
            x.source.id == this.id &&
            x.destination.id == node.id));
        this.connections = this.connections.filter(x => x != wire);

        node.owner.evaluate();
        this.owner.evaluate();
        circuit.evaluateAll();

        if (node.connections.length == 0 && node.nodeType == 'node')
            circuit.removeModule(node.owner);
        if (this.connections.length == 0 && this.nodeType == 'node')
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
            if (thisNode.nodeType != 'node' && otherNode.nodeType != 'node') return;
            if (otherNode.nodeType == 'node') {
                [thisNode, otherNode] = [otherNode, thisNode];
            }
            thisNode.connections.forEach(wire => {
                let destination = wire.destination;
                circuit.removeModule(thisNode.owner);
                otherNode.connect(destination);
                // console.log('replaced')
            });

        }
    }
    hovering() {
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
        stroke(0);
        strokeWeight(2);
        fill(State.color(this.value));
        circle(netX, netY, this.hovering() ? 14 : 10);
        if (DEBUG) {
            push();
            // text(this.name, netX, netY - 12);
            // text(this.isHighZ, netX, netY - 22);
            // text(this.id.slice(0, 10), netX, netY - 10);
            noStroke();
            fill(0);
            textSize(15);
            text(this.delay, netX + 5, netY - 15);
            text(this.totalDelay, netX + 5, netY + 15);
            
            pop();
        }
    }
    pressed() {
        this.isHovering = this.hovering();
        if (this.isHovering && pressedObject.id == 0) {
            pressedObject = this;
            if (mouseButton == LEFT) {
                line(this.getCanvasX(), this.getCanvasY(), mouseCanvasX, mouseCanvasY);
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
        let y = Math.round(mouseCanvasY / 20) * 20
        let dest = WireNode.add(x, y);
        clickedNode.connect(dest.inputs[0]);
        clickedNode = null;
        return dest;
    }
}

class InputNode extends ModuleNode {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = State.highZ) {
        super(owner, name, relativeX, relativeY, value);
        this.nodeType = 'input';
    }
}

class OutputNode extends ModuleNode {
    constructor(owner, name, relativeX = 0, relativeY = 0, value = State.highZ, delay = 1) {
        super(owner, name, relativeX, relativeY, value, delay);
        this.nodeType = 'output';
    }
}