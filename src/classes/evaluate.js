import { State } from "./state.js";

export function evaluateAll(reset = true, initTime = 0) {
    if (reset) {
        this.getNodes().forEach((node) => {
            node.valueAtTime = {
                0: [...node.getValueAtTime(0).fill(State.highZ)],
            };
            node.isHighZAtTime = { 0: [...node.getHighZAtTime(0).fill(true)] };
        });
        this.getModules().forEach((mod) => mod.init());
    }
    let startingNodes = [];
    this.getNodes().forEach((node) => {
        // inefficient
        node.valueAtTime = { 0: [...node.getValueAtTime(Infinity)] };
        node.isHighZAtTime = { 0: [...node.getHighZAtTime(Infinity)] };
        // console.log(node.name + node.isHighZAtTime[0])
    });
    this.modules.forEach((m) => {
        if (m.isInputModule()) {
            m.setInput(m.outputValue);
            // console.log(m);
            [...m.outputs[0].getValueAtTime(0)]
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
                Object.entries(node.getValueAtTime(0)).forEach((x) => {
                    let index = x[0];
                    if (!node.connectedToOutput(index, 0).isConnectedToOutput) {
                        startingNodes.push([0, index, node]);
                    }
                    if (
                        node.connectedToOutput(index, 0).activeOutputsCount == 0
                    ) {
                        node.setValueAtIndexAtTime(0, index, State.highZ);
                        node.setHighZAtIndexAtTime(0, index, true);
                    }
                });
            });
            m.outputs.forEach((node) => {
                // unsure
            });
        }
    });
    this.modules.forEach((m) => {
        m.inputs.forEach((node) => {
            Object.entries(node.getValueAtTime(0)).forEach((x) => {
                let index = x[0];
                if (node.connectedToOutput(index, 0).activeOutputsCount == 0) {
                    node.setValueAtIndexAtTime(0, index, State.highZ);
                    node.setHighZAtIndexAtTime(0, index, true);
                }
            });
        });
    });

    let evalQueue = [];
    startingNodes.forEach((item) => {
        let node = item[2];
        node.setValues(node.valueAtTime[0], 0, false);
    });
    evalQueue = startingNodes;

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
            currentModule.outputs.forEach((node) => {
                let currentNodeValue = node.getValueAtTime(currentTime);
                let futureNodeValue = node.getValueAtTime(
                    currentTime + node.delay
                );
                let valueChanged = node
                    .getValueAtTime(currentTime)
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
                    evalQueue.push([currentTime, destIndex, dest]);
                }
            } else {
                evalQueue.push([currentTime, currentIndex, dest]);
            }
        });
        iteration++;
    }
    if (iteration >= maxIteration) {
        console.error("Error: Iteration limit exceeded! ");
        pushAlert("error", "Error: Iteration limit exceeded!");
    }
    this.getNodes()
        .filter((node) => node.nodeType == "output")
        .forEach((node) => {
            Object.entries(node.getValueAtTime(Infinity)).forEach((x) => {
                let initIndex = 0;
                if (node.getHighZAtTime(Infinity)[initIndex]) return;
                let stack = [];
                let traversed = new Set();
                let marked = new Set();
                marked.add(currentItemToString(0, initIndex, node.id));
                stack.push([initIndex, node]);
                while (stack.length > 0) {
                    let [index, currentNode] = stack.pop();
                    index = parseInt(index);
                    if (
                        !traversed.has(
                            currentItemToString(0, index, currentNode.id)
                        )
                    ) {
                        traversed.add(
                            currentItemToString(0, index, currentNode.id)
                        );

                        currentNode.connections.forEach((wire) => {
                            let destinationNode = wire.destination;
                            if (
                                !marked.has(
                                    currentItemToString(
                                        0,
                                        index,
                                        destinationNode.id
                                    )
                                )
                            ) {
                                marked.add(
                                    currentItemToString(
                                        0,
                                        index,
                                        destinationNode.id
                                    )
                                );
                                // console.log(currentNode.id, destinationNode.id)
                                wire.setDirection(currentNode, destinationNode);
                            }
                            if (wire.isSplitterConnection()) {
                                let newIndex = destinationNode.indices.indexOf(
                                    index + Math.min(...currentNode.indices)
                                );
                                if (newIndex != -1) {
                                    stack.push([newIndex, destinationNode]);
                                }
                                return;
                            }
                            stack.push([index, destinationNode]);
                        });
                    }
                }
            });
        });
};