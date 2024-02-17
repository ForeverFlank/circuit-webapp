Circuit.prototype.evaluateAll = function(reset = true, initTime = 0) {
    if (reset) {
        this.getNodes().forEach((node) => (node.totalDelay = []));
    }
    let startingNodes = [];
    this.modules.forEach((m) => {
        m.inputs.concat(m.outputs).forEach((node) => {
            node.valueAtTime = {};
        });
        if (m.isInputModule()) {
            m.setInput(m.outputValue);
            [...m.outputs[0].value]
                .fill(0)
                .map((x, y) => x + y)
                .forEach((index) => {
                    startingNodes.push([0, index, m.outputs[0]]);
                });
        } else {
            m.inputs.forEach((node) => {
                console.log(node);
                Object.entries(node.value).forEach((x) => {
                    let index = x[0];
                    if (
                        !node.connectedToOutput(index).isConnectedToOutput
                    ) {
                        startingNodes.push([0, index, node]);
                    }
                    // fix here
                    if (0) {
                        node.isHighZ[index] = true;
                        node.value[index] = State.highZ;
                        console.log('setz1', node.name, index)
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
                    console.log('setz2', node.name, index)
                }
            });
        });
    });

    let evalQueue = [];
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

    console.log(evalQueue.map((x) => x[2].owner.name));
    // console.log('pre2', this.getNodes())
    let traversed = new Set();
    function currentItemToString(time, index, nodeId) {
        return `t${time}i${index}n${nodeId}`;
    }
    let iteration = 0;
    let maxIteration = 100;
    while (iteration < maxIteration && evalQueue.length > 0) {
        evalQueue.sort((a, b) => a[0] - b[0]);
        let item = evalQueue.shift();
        // console.log("queue", evalQueue, "traversed", traversed);
        let currentTime = item[0];
        let currentIndex = item[1];
        let currentNode = item[2];
        /*
        console.log(
            currentNode.owner.name,
            ".",
            currentNode.name,
            currentIndex
        );
        */
        let currentModule = currentNode.owner;
        let itemString = currentItemToString(
            currentTime,
            currentIndex,
            currentNode.id
        );
        if (traversed.has(itemString)) {
            // console.log('!cont')
            continue;
        }
        traversed.add(itemString);
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
                    console.log(
                        currentNode.name,
                        currentIndex,
                        "->",
                        dest.name,
                        destIndex
                    );
                    evalQueue.push([currentTime, destIndex, dest]);
                }
            } else {
                evalQueue.push([currentTime, currentIndex, dest]);
            }
            // console.log('pushing', [currentTime, currentIndex, dest])
        });
        // save init state, remove from queue if state same after eval
        if (currentNode.isInputNode()) {
            currentModule.outputs.forEach((node) => {
                // console.log('D', node.delay)
                evalQueue.push([
                    currentTime + node.delay,
                    currentIndex,
                    node,
                ]);
            });
            currentModule.evaluate(currentTime, true);
        }

        iteration++;
    }
    if (iteration >= maxIteration) {
        console.error("Error: Iteration limit exceeded! ");
        pushAlert("error", "Error: Iteration limit exceeded!");
    }
}