Circuit.prototype.evaluateAll = function (reset = true, initTime = 0) {
    if (reset) {
        this.getNodes().forEach((node) => {
            node.value.fill(State.highZ);
            node.isHighZ.fill(true);
        });
        this.getModules().forEach((mod) => mod.init());
    }
    let startingNodes = [];
    this.getNodes().forEach((node) => (node.valueAtTime = {}));
    this.modules.forEach((m) => {
        if (m.isInputModule()) {
            m.setInput(m.outputValue);
            [...m.outputs[0].value]
                .fill(0)
                .map((x, y) => x + y)
                .forEach((index) => {
                    startingNodes.push([0, index, m.outputs[0]]);
                });
        }
    });
    this.modules.forEach((m) => {
        if (!m.isInputModule()) {
            m.inputs.forEach((node) => {
                // console.log(node);
                Object.entries(node.value).forEach((x) => {
                    let index = x[0];
                    // console.log("q", node.name, index);
                    if (!node.connectedToOutput(index).isConnectedToOutput) {
                        startingNodes.push([0, index, node]);
                    }
                    if (node.connectedToOutput(index).activeOutputsCount == 0) {
                        node.isHighZ[index] = true;
                        node.value[index] = State.highZ;
                        // console.log("setz1", node.name, index);
                    }
                    node.valueAtTime[0] = node.value;
                });
            });
            m.outputs.forEach((node) => {
                node.valueAtTime[0] = node.value;
            });
        }
    });
    this.modules.forEach((m) => {
        m.inputs.forEach((node) => {
            Object.entries(node.value).forEach((x) => {
                let index = x[0];
                if (node.connectedToOutput(index).activeOutputsCount == 0) {
                    node.value[index] = State.highZ;
                    node.isHighZ[index] = true;
                    node.valueAtTime[0] = node.value;
                    // console.log("setz2", node.name, index);
                }
            });
        });
    });

    let evalQueue = [];
    let checkQueue = [];
    /*
    startingNodes.forEach((node) => {
        node.value.forEach((value, index) => {
            evalQueue.push([0, index, node]);
        });
    });
    */
    startingNodes.forEach((item) => {
        let node = item[2];
        node.setValues(node.valueAtTime[0], 0, false);
    });
    evalQueue = startingNodes;

    // console.log(evalQueue.map((x) => x[2].owner.name));

    let traversed = new Set();
    function currentItemToString(time, index, nodeId) {
        return `t${time}i${index}n${nodeId}`;
    }
    let iteration = 0;
    let maxIteration = 10000;
    let currentTime = 0;
    let lastTime = 0;
    while (iteration < maxIteration && evalQueue.length > 0) {
        evalQueue.sort((a, b) => a[0] - b[0]);
        let item = evalQueue.shift();
        // console.log("queue", evalQueue, "traversed", traversed);
        lastTime = currentTime;
        currentTime = item[0];
        let currentIndex = item[1];
        let currentNode = item[2];
        let currentModule = currentNode.owner;
        let itemString = currentItemToString(
            currentTime,
            currentIndex,
            currentNode.id
        );
        if (traversed.has(itemString)) {
            continue;
        }
        traversed.add(itemString);
        /*
        console.log(
            currentTime,
            currentNode.owner.name,
            currentNode.name,
            currentIndex
        );
        */
        if (currentNode.isInputNode()) {
            currentModule.evaluate(currentTime, true);
            /*
            console.log("ev", [
                ...currentModule.outputs.map((x) => x.valueAtTime),
            ]);
            */
            currentModule.outputs.forEach((node) => {
                /*
                console.log(
                    "F",
                    currentTime,
                    node.getValue(currentTime),
                    node.getValue(currentTime + node.delay),
                    JSON.parse(JSON.stringify(node.valueAtTime))
                );
                */
                let currentNodeValue = node.getValue(currentTime);
                let futureNodeValue = node.getValue(currentTime + node.delay);
                let valueChanged = node
                    .getValue(currentTime)
                    .some(
                        (x, index) =>
                            currentNodeValue[index] != futureNodeValue[index]
                    );
                if (valueChanged) {
                    evalQueue.push([
                        currentTime + node.delay,
                        currentIndex,
                        node,
                    ]);
                }
            });
        }

        currentNode.connections.forEach((wire) => {
            let dest = wire.destination;
            if (
                traversed.has(
                    currentItemToString(currentTime, currentIndex, dest.id)
                )
            ) {
                return;
            }
            // wire.setDirection(currentNode, dest);
            if (wire.isSplitterConnection()) {
                let destIndex = dest.indices.indexOf(
                    currentIndex + Math.min(...currentNode.indices)
                );

                if (destIndex != -1) {
                    /*
                    console.log(
                        currentNode.name,
                        currentIndex,
                        "->",
                        dest.name,
                        destIndex
                    );
                    */
                    evalQueue.push([currentTime, destIndex, dest]);
                }
            } else {
                evalQueue.push([currentTime, currentIndex, dest]);
            }
        });
        // console.log("qE", [...evalQueue]);
        iteration++;
        // console.log(iteration)
    }
    if (iteration >= maxIteration) {
        console.error("Error: Iteration limit exceeded! ");
        pushAlert("error", "Error: Iteration limit exceeded!");
    }
};
