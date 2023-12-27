class Circuit extends Module {
    constructor(name) {
        super(name);
        this.modules = [];
        this.inputModules = [];
        this.outputModules = [];
    }
    getModules() {
        return this.modules;
    }
    getNodes() {
        let nodes = [];
        this.modules.forEach(x =>
            nodes = nodes.concat(x.inputs.concat(x.outputs)));
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
        module.inputs.concat(module.outputs).forEach(x => x.disconnectAll());
        this.modules = this.modules.filter(x => x.id != module.id);
        if (evaluate) {
            this.evaluateAll();
        }
    }
    evaluate() {
        // this.evaluateAll(false);
    }
    evaluateAll(reset = true) {
        if (reset) {
            this.getNodes().forEach(node => node.totalDelay = []);
        }
        let startingNodes = [];
        this.modules.forEach(m => {
            m.inputs.concat(m.outputs).forEach(x => {
                x.valueAtTime = {};
            });
            if (m.name == 'Input') {
                m.setInput(m.outputValue);
                startingNodes.push(m.outputs[0]);
            } else {
                m.inputs.forEach(x => {
                    if (x.connectedToOutput().isConnectedToOutput) {
                    } else {
                        startingNodes.push(x);
                    }
                    if (x.nodeType == 'node' || reset) {
                        x.isHighZ = true;
                        x.value = State.highZ;
                        x.valueAtTime[0] = State.highZ;
                    } else {
                        x.valueAtTime[0] = x.value;
                    }
                });
                m.outputs.forEach(x => {
                    x.valueAtTime[0] = x.value;
                });

            }
        });
        this.modules.forEach(m => {
            m.inputs.forEach(x => {
                if (x.connectedToOutput().outputsCount == 0) {
                    x.isHighZ = true;
                    x.value = State.highZ;
                    x.valueAtTime[0] = State.highZ;
                }
            });
        });
        startingNodes.forEach(node => {
            node.totalDelay = [0];
            let stack = [];
            let traversed = new Set();
            let marked = new Set();
            stack.push(node);
            let iter = 0;
            while (stack.length > 0 && iter <= 1000) {
                let src = stack.pop();
                // console.log(src)
                let srcDelay = src.totalDelay;
                if (!traversed.has(src.id)) {
                    traversed.add(src.id);
                    src.connections.forEach(wire => {
                        let dest = wire.destination;
                        let delay = srcDelay;
                        dest.totalDelay = dest.totalDelay.concat(delay);
                        dest.totalDelay = [...new Set(dest.totalDelay)];
                        stack.push(dest);
                    });
                    if (src.nodeType == 'input' && !src.owner.isSubModule) {
                        let outputs = src.owner.outputs;
                        outputs.forEach(outputNode => {
                            let stack2 = [];
                            let traversed2 = new Set();
                            stack2.push(outputNode);
                            while (stack2.length > 0) {
                                let x = stack2.pop();
                                if (!traversed2.has(x.id)) {
                                    traversed2.add(x.id);
                                    traversed.delete(x.id);
                                    x.connections.forEach(w => {
                                        let d = w.destination;
                                        stack2.push(d);
                                    })
                                }
                            }
                            traversed.delete(outputNode.id);
                            let delay = src.totalDelay.map(x => x + outputNode.delay);
                            outputNode.totalDelay = outputNode.totalDelay.concat(delay);
                            outputNode.totalDelay = [...new Set(outputNode.totalDelay)];
                            stack.push(outputNode);
                        });
                    } else if (src.owner.isSubModule) {
                        
                    }
                }
                iter++;
            }
            if (iter >= 1000) {
                console.log('overflow')
            }
        });
        let queue = [];
        let nodes = this.getNodes();
        nodes.forEach(node => {
            // console.log('!', node.name, node.totalDelay)
            // node.totalDelay = [...new Set(node.totalDelay)];
            // node.valueAtTime
            node.totalDelay.sort();
            node.setValue(node.valueAtTime[0], 0, false);
            node.totalDelay.forEach(t => {
                queue.push([t, node]);
            });
        });
        queue = queue.sort((a, b) => a[0] - b[0]);
        console.log('q', queue)
        let iter = 0;
        queue
            .filter(x => x[1].nodeType == 'input' || x[1].nodeType == 'node')
            .forEach(x => {
                if (iter > 1000) return;
                console.log('-', x[1].owner.name, x[1].name)
                // x[1].setValue(x[1].value, x[0], false);
                // x[1].valueAtTime[x[0]] = x[1].value;
                let isSubmoduleIO = false;
                if (!isSubmoduleIO) {
                    x[1].owner.evaluate(x[0], true);
                }
                iter++;

            });
        if (iter >= 1000) console.log('flowover')
        console.log(this.getNodes())
    }
    toModule(width) {
        let inputs = this.inputModules;
        let outputs = this.outputModules;
        for (let i in inputs) {
            let newNode = new ModuleNode(this, 'input' + i,
                                         parseInt(0), parseInt(i));
            newNode.linkInputModule(this.inputs[i]);
            this.inputs.push(newNode);
            // this.inputs.push(inputs[i].outputs[0]);
            // this.inputs[i].owner = this;
            // this.inputs[i].nodeType = 'node';
            // this.inputs[i].relativeX = parseInt(0);
            // this.inputs[i].relativeY = parseInt(i);
            // this.modules = this.modules.filter(x => x.id != inputs[i].id);
            // this.inputModules = this.inputModules.filter(x => x.id != inputs[i].id);
        }
        for (let i in outputs) {
            let newNode = new ModuleNode(this, 'output' + i,
                                         parseInt(width), parseInt(i));
            newNode.linkOutputModule(this.outputs[i]);
            this.outputs.push(newNode);
            // this.outputs.push(outputs[i].inputs[0]);
            // this.outputs[i].owner = this;
            // this.outputs[i].nodeType = 'node';
            // this.outputs[i].relativeX = parseInt(width);
            // this.outputs[i].relativeY = parseInt(i);
            // this.modules = this.modules.filter(x => x.id != outputs[i].id);
            // this.outputModules = this.outputModules.filter(x => x.id != outputs[i].id);
        }
        this.inputs.concat(this.outputs).forEach(x => {
            x.connections.forEach(wire => {
                wire.isSubModuleWire = true;
            });
        });
        // this.inputs = this.inputModules.map(x => x.outputs[0]);
        // this.outputs = this.outputModules.map(x => x.inputs[0]);
        this.isSubModule = true;
        return this;
    }
}

let nameID = 0;
var circuit = new Circuit('Circuit');
var customModules = {};

function saveModule() {
    let name = 'MODULE' + nameID;
    // let newModule = Object.assign(Object.create(Object.getPrototypeOf(circuit)), circuit);
    let newModule = circuit;
    // console.log(newModule)

    let width = 3
    newModule.name = name;
    newModule.displayName = name;
    newModule.width = width;
    newModule.height = max(newModule.inputModules.length, newModule.outputModules.length) + 1;
    customModules[name] = newModule.toModule(width);
    // console.log(customModules[name]);

    circuit = new Circuit('Circuit');

    let button = document.createElement('button');
    button.textContent = name;
    button.addEventListener('click', () => circuit.addModule(customModules[name]));
    document.getElementById('module-button-container').appendChild(button);

    console.log(customModules[name])
    nameID++;
}