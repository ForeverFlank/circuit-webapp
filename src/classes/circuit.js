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
            if (isInputModule(m)) {
                m.setInput(m.outputValue);
                [...m.outputs[0].value]
                    .fill(0)
                    .map((x, y) => x + y)
                    .forEach((index) => {
                        startingNodes.push([0, index, m.outputs[0]]);
                    });
            } else {
                m.inputs.forEach((node) => {
                    Object.entries(node.value).forEach((x) => {
                        let index = x[0];
                        if (node.connectedToOutput(index).isConnectedToOutput) {
                        } else {
                            startingNodes.push([0, index, node]);
                        }
                        if (node.isGenericNode() || reset) {
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
        while (iteration < 100 && evalQueue.length > 0) {
            evalQueue.sort((a, b) => a[0] - b[0]);
            let item = evalQueue.shift();
            console.log("queue", evalQueue, "traversed", traversed);
            let currentTime = item[0];
            let currentIndex = item[1];
            let currentNode = item[2];
            console.log(
                currentNode.owner.name,
                ".",
                currentNode.name,
                currentIndex
            );
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
                wire.setDirection(currentNode, dest)
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
        if (iteration >= 100) {
            console.error("Iteration limit exceeded!");
        }
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
