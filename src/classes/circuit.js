class Circuit extends Module {
    constructor(name) {
        super(name);
        this.modules = [];
        this.inputModules = [];
        this.outputModules = [];
    }
    getModules() {
        let modules = this.modules;
        this.modules.forEach((x) => {
            if (x.isSubModule) {
                modules = modules.concat(x.getModules());
            }
        });
        return this.modules;
    }
    getNodes() {
        let nodes = [];
        this.modules.forEach((x) => {
            nodes = nodes.concat(x.inputs.concat(x.outputs));
            if (x.isSubModule) {
                nodes = nodes.concat(x.getNodes());
            }
        });
        return nodes;
    }
    addModule(module, evaluate = true) {
        this.modules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    addInputModule(module, evaluate = true) {
        this.modules.push(module);
        this.inputModules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    addOutputModule(module, evaluate = true) {
        this.modules.push(module);
        this.outputModules.push(module);
        if (evaluate) {
            this.evaluateAll();
        }
        return module;
    }
    removeModule(module, evaluate = true) {
        module.inputs.concat(module.outputs).forEach((x) => x.disconnectAll());
        this.modules = this.modules.filter((x) => x.id != module.id);
        this.inputModules = this.inputModules.filter((x) => x.id != module.id);
        this.outputModules = this.outputModules.filter(
            (x) => x.id != module.id
        );
        if (evaluate) {
            this.evaluateAll();
        }
    }
    evaluate() {
        // this.evaluateAll(false);
    }
    evaluateAll(reset = true, initTime = 0) {
        if (reset) {
            this.getNodes().forEach((node) => (node.totalDelay = []));
        }
        let startingNodes = [];
        this.modules.forEach((m) => {
            m.inputs.concat(m.outputs).forEach((node) => {
                node.valueAtTime = {};
            });
            if (m.name == "Input") {
                m.setInput(m.outputValue);
                startingNodes.push(m.outputs[0]);
            } else {
                m.inputs.forEach((node) => {
                    Object.entries(node.value).forEach((x) => {
                        let index = x[0];
                        if (node.connectedToOutput(index).isConnectedToOutput) {
                        } else {
                            startingNodes.push(node);
                        }
                        if (node.nodeType == "node" || reset) {
                            node.isHighZ[index] = true;
                            node.value[index] = State.highZ;
                            node.valueAtTime[0] = node.value;
                        } else {
                            node.valueAtTime[0] = node.value;
                        }
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
                    if (node.connectedToOutput(index).outputsCount == 0) {
                        node.isHighZ[index] = true;
                        node.value[index] = State.highZ;
                        node.valueAtTime[0] = node.value;
                    }
                });
            });
        });

        let evalQueue = [];
        startingNodes.forEach((node) => {
            node.value.forEach((value, index) => {
                evalQueue.push([0, index, node]);
            });
        });
        console.log('pre1', this.getNodes())
        startingNodes.forEach((node) => {
            node.setValues(node.valueAtTime[0], 0, false);
        });
        console.log('pre2', this.getNodes())
        let traversed = new Set();
        function currentItemToString(time, index, nodeId) {
            return `t${time}i${index}n${nodeId}`;
        }
        let iteration = 0;
        while (iteration < 10 && evalQueue.length > 0) {
            evalQueue.sort((a, b) => a[0] - b[0]);
            let item = evalQueue.shift();
            // console.log("queue", evalQueue, "traversed", traversed);
            let currentTime = item[0];
            let currentIndex = item[1];
            let currentNode = item[2];
            console.log('item', item, currentTime)
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
                if (currentNode.isSplitter && dest.isSplitter) {
                    let destIndex = dest.indices.indexOf(currentIndex);
                    evalQueue.push([currentTime, destIndex, dest]);
                }
                else {
                    evalQueue.push([currentTime, currentIndex, dest]);
                }
                // console.log('pushing', [currentTime, currentIndex, dest])
            });
            if (currentNode.nodeType == "input") {
                currentModule.outputs.forEach((node) => {
                    console.log('D', node.delay)
                    evalQueue.push([
                        currentTime + node.delay,
                        currentIndex,
                        node,
                    ]);
                });
                currentModule.evaluate(currentTime, true)
            }
            if (currentNode.nodeType == "node") {
            } else if (currentNode.nodeType == "input") {
                // currentModule.evaluate(currentTime - currentNode.delay, true);
            }
            // console.log(currentNode.name);

            iteration++;
        }
        if (iteration >= 10) {
            console.error("Iteration limit exceeded!");
        }
        console.log("eeeeeeeeeeeee");
        /*
        startingNodes.forEach((node) => {
            node.totalDelay = [0];
            let stack = [];
            let traversed = new Set();
            let marked = new Set();
            let queue = [];
            stack.push(node);
            let iter = 0;
            while (stack.length > 0 && iter <= 10000) {
                let src = stack.pop();

                console.log(
                    "! Evaluating from source",
                    src.owner.name,
                    "->",
                    src.name,
                    "with connections to",
                    src.connections.map(
                        (x) =>
                            x.destination.owner.name + " " + x.destination.name
                    )
                );

                let srcDelay = src.totalDelay;
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    src.connections.forEach((wire) => {
                        let dest = wire.destination;
                        let delay = srcDelay;
                        dest.totalDelay = dest.totalDelay.concat(delay);
                        dest.totalDelay = [...new Set(dest.totalDelay)];
                        stack.push(dest);
                    });

                    // fix below when the gate is output inside a submodule
                    
                    if (
                        src.nodeType == "input" &&
                        !src.owner.isSubModule &&
                        src.owner.linkedNode == null
                    ) {
                        console.log("aaa", src);
                        let outputs = src.owner.outputs;
                        outputs.forEach((outputNode) => {
                            let stack2 = [];
                            let traversed2 = new Set();
                            stack2.push(outputNode);
                            while (stack2.length > 0) {
                                let x = stack2.pop();
                                if (!traversed2.has(x.id)) {
                                    traversed2.add(x.id);
                                    traversed.delete(x.id);
                                    x.connections.forEach((w) => {
                                        let d = w.destination;
                                        stack2.push(d);
                                    });
                                }
                            }
                            traversed.delete(outputNode.id);
                            let delay = src.totalDelay.map(
                                (x) => x + outputNode.delay
                            );
                            outputNode.totalDelay =
                                outputNode.totalDelay.concat(delay);
                            outputNode.totalDelay = [
                                ...new Set(outputNode.totalDelay),
                            ];
                            stack.push(outputNode);
                        });
                    }
                    
                }
                iter++;
            }
            if (iter >= 10000) {
                console.log("overflow 1");
            }
        });

        */
        /*
        console.log("start", startingNodes);
        let queue = [];
        let nodes = this.getNodes();
        console.log(nodes);
        nodes.forEach((node) => {
            // console.log('!', node.name, node.totalDelay)
            // node.totalDelay = [...new Set(node.totalDelay)];
            // node.valueAtTime
            node.totalDelay.sort();
            node.setValues(node.valueAtTime[0], 0, false);
            node.totalDelay.forEach((t) => {
                queue.push([t, node]);
            });
        });
        queue = queue.sort((a, b) => a[0] - b[0]);
        console.log("q", queue);
        let iter = 0;
        queue
            .filter((x) => x[1].nodeType == "input" || x[1].nodeType == "node")
            .forEach((x) => {
                if (iter > 10000) return;
                console.log("-", x[1].owner.name, x[1].name);
                // x[1].setValue(x[1].value, x[0], false);
                // x[1].valueAtTime[x[0]] = x[1].value;
                let isSubmoduleIO = false;
                if (!isSubmoduleIO) {
                    x[1].owner.evaluate(x[0], true);
                }
                iter++;
            });
        if (iter >= 10000) console.log("overflow 2");
        */
    }
    toModule() {
        let newModule = new Circuit();
        newModule.modules = this.modules;
        newModule.inputModules = this.inputModules;
        newModule.outputModules = this.outputModules;
        newModule.name = this.name;
        newModule.id = unique(this.name);
        newModule.displayName = this.name;
        let width = this.width;
        newModule.width = width;
        newModule.height =
            max(this.inputModules.length, this.outputModules.length) + 1;

        gridNodeLookup = {};
        let inputs = newModule.inputModules;
        let outputs = newModule.outputModules;
        for (let i in inputs) {
            let newNode = new ModuleNode(
                newModule,
                "input" + i,
                parseInt(0),
                parseInt(i)
            );
            let [wire1, wire2] = newNode.connect(inputs[i].outputs[0]);
            wire1.isSubModuleWire = true;
            wire2.isSubModuleWire = true;
            newModule.inputs.push(newNode);
        }
        for (let i in outputs) {
            let newNode = new ModuleNode(
                newModule,
                "output" + i,
                parseInt(width),
                parseInt(i)
            );
            let [wire1, wire2] = newNode.connect(outputs[i].inputs[0]);
            wire1.isSubModuleWire = true;
            wire2.isSubModuleWire = true;
            newModule.outputs.push(newNode);
        }
        newModule.inputs.concat(newModule.outputs).forEach((x) => {
            x.connections.forEach((wire) => {
                wire.isSubModuleWire = true;
            });
        });
        newModule.isSubModule = true;
        return newModule;
    }
    add() {
        circuit.addModule(this.toModule());
    }
}

let nameID = 0;
var circuit = new Circuit("Circuit");
var customModules = {};

function toSubModule() {
    let name = "MODULE" + nameID;
    // let newModule = Object.assign(Object.create(Object.getPrototypeOf(circuit)), circuit);
    let newModule = circuit;
    // console.log(newModule)

    let width = 3;
    newModule.name = name;
    newModule.displayName = name;
    newModule.width = width;
    newModule.height =
        max(newModule.inputModules.length, newModule.outputModules.length) + 1;
    customModules[name] = newModule;
    // console.log(customModules[name]);

    circuit = new Circuit("Circuit");

    let button = document.createElement("button");
    button.textContent = name;
    button.addEventListener("click", () => {
        customModules[name].add(width);
        console.log(">>", circuit);
    });
    document.getElementById("module-button-container").appendChild(button);

    nameID++;
}
