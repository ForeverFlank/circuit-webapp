import { Module, WireNode, Input, Output } from "./module.js";
import { evaluateAll } from "./evaluate.js";

class Circuit extends Module {
    constructor(obj) {
        super(obj);
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
    getNodes(includeSubModuleNodes = true) {
        let nodes = [];
        this.modules.forEach((x) => {
            nodes = nodes.concat(x.inputs.concat(x.outputs));
            if (x.isSubModule && includeSubModuleNodes) {
                nodes = nodes.concat(x.getNodes());
            }
        });
        return nodes;
    }
    addModule(mod, evaluate = true) {
        this.modules.push(mod);
        if (evaluate) {
            this.evaluateAll();
        }
        return mod;
    }
    addInputModule(mod, evaluate = true) {
        this.modules.push(mod);
        this.inputModules.push(mod);
        if (evaluate) {
            this.evaluateAll();
        }
        return mod;
    }
    addOutputModule(mod, evaluate = true) {
        this.modules.push(mod);
        this.outputModules.push(mod);
        if (evaluate) {
            this.evaluateAll();
        }
        return mod;
    }
    removeModule(mod, evaluate = true) {
        mod.inputs.concat(mod.outputs).forEach((x) => x.disconnectAll());
        this.modules = this.modules.filter((x) => x.id != mod.id);
        this.inputModules = this.inputModules.filter((x) => x.id != mod.id);
        this.outputModules = this.outputModules.filter((x) => x.id != mod.id);
        if (evaluate) {
            this.evaluateAll();
        }
    }
    evaluate() {
        // this.evaluateAll(false);
    }
    evaluateAll() {
        evaluateAll.call(this);
    }
    serialize() {
        let moduleData = super.serialize();
        moduleData.modulesId = this.modules.map((m) => m.id);
        moduleData.inputModulesId = this.inputModules.map((m) => m.id);
        moduleData.outputModulesId = this.outputModules.map((m) => m.id);
        return moduleData;
    }
    static fromModulesArray(modulesArray, name) {
        let newCircuit = new Circuit(name);
        modulesArray.forEach((mod) => {
            if (mod.isInputModule()) {
                newCircuit.addInputModule(mod, false);
            } else if (mod.isOutputModule()) {
                newCircuit.addOutputModule(mod, false);
            } else {
                newCircuit.addModule(mod, false);
            }
        });
        return newCircuit;
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
        currentCircuit.addModule(this.toModule());
    }
}

let nameId = 0;
var customModules = {};

function toSubModule() {
    let name = "MODULE" + nameId;
    // let newModule = Object.assign(Object.create(Object.getPrototypeOf(circuit)), circuit);
    let newModule = currentCircuit;
    // console.log(newModule)

    let width = 3;
    newModule.name = name;
    newModule.displayName = name;
    newModule.width = width;
    newModule.height =
        max(newModule.inputModules.length, newModule.outputModules.length) + 1;
    customModules[name] = newModule;
    // console.log(customModules[name]);

    currentCircuit = new Circuit("Circuit");

    let button = document.createElement("button");
    button.textContent = name;
    button.addEventListener("click", () => {
        customModules[name].add(width);
        console.log(">>", currentCircuit);
    });
    document.getElementById("module-button-container").appendChild(button);

    nameId++;
}

export { Circuit };