function exportSerializedCircuit() {
    let modules = currentCircuit.modules;
    let nodes = currentCircuit.getNodes();
    let wires = nodes.map((node) => node.connections).flat();

    let serializedModules = modules.map((x) => x.serialize());
    let serializedNodes = nodes.map((x) => x.serialize());
    let serializedWires = wires.map((x) => x.serialize());

    let exportData = {
        modules: serializedModules,
        nodes: serializedNodes,
        wires: serializedWires,
    };
    let exportJson = JSON.stringify(exportData);
    // navigator.clipboard.writeText(exportJson);
    // pushAlert("info", "Copied export data to clipboard!")
    console.log(exportJson);
    console.log("!!! Export !!!");
}

function importSerializedCircuit(string) {
    let importedData = JSON.parse(string);
    let importedModules = importedData["modules"];
    let importedNodes = importedData["nodes"];
    let importedWires = importedData["wires"];

    console.log(importedModules, importedNodes, importedWires)

    importedWires = importedWires.map((wire) => {
        let source = importedNodes.find((node) => wire.sourceId == node.id);
        let destination = importedNodes.find(
            (node) => wire.destinationId == node.id
        );
        // console.log('sd', source, destination)
        delete wire.sourceId;
        delete wire.destinationId;
        return Wire.deserialize(wire, source, destination);
    });

    console.log(importedWires)

    importedModules = importedModules.map((mod) => {
        let inputs = mod.inputsId.map((id) =>
            importedNodes.find((node) => id == node.id)
        );
        let outputs = mod.outputsId.map((id) =>
            importedNodes.find((node) => id == node.id)
        );
        console.log('io', inputs, outputs)
        delete mod.inputsId;
        delete mod.outputsId;
        console.log(mod.name)
        let newModule = getModuleClassByName(mod.name);
        newModule.fromSerialized(mod, inputs, outputs);
        return newModule;
        // return Module.deserialize(mod, inputs, outputs);
    });

    importedNodes = importedNodes.map((node) => {
        let owner = importedModules.find((mod) => node.ownerId == mod.id);
        let connections = node.connectionsId.map((id) =>
            importedWires.find((wire) => id == wire.id)
        );
        delete node.ownerId;
        delete node.connectionsId;
        // console.log('oc', owner, connections)
        let newNode = getNodeClassByObject(node);
        newNode.fromSerialized(node, owner, connections);
        return newNode;
        // return ModuleNode.deserialize(node, owner, connections);
    });

    console.log(importedModules);
    currentCircuit = Circuit.fromModulesArray(importedModules);
    // currentCircuit = new Circuit();
    // console.log(importedModules);
}

function getModuleClassByName(name) {
    // let newModule;
    switch (name) {
        case "Input":
            return new Input();
        case "Output":
            return new Output();
        case "NOT Gate":
            return new NotGate();
        default:
            break;
    }
}

function getNodeClassByObject(object) {
    let defaultParameters = [null, null, 0, 0, [State.highZ], 0, false]
    if (object.nodeType == "input") {
        return new InputNode(...defaultParameters);
    }
    if (object.nodeType == "output") {
        return new OutputNode(...defaultParameters);
    }
    if (object.nodeType == "node") {
        if (object.isSplitter) {
            return new SplitterNode(...defaultParameters);
        }
        return new ModuleNode(...defaultParameters);
    }
}

function importCircuitPrompt() {
    let html = `
    <div class="flex flex-col gap-y-2">
      <p class="text-zinc-600 text-sm">Placeholder</p>
      <input id="modal-circuit-import-string" class="border p-2 h-8 w-full rounded-sm focus-outline text-sm text-zinc-600"
        type="text" placeholder="" />
    </div>

    <div class="flex flex-row justify-end w-full gap-x-2">
      <button id="modal-cancel" class="bg-white w-20 h-8 text-sm rounded border border-zinc-200" onclick="closeModalMenu()">Cancel</button>
      <button id="modal-submit" class="bg-blue-500 w-20 h-8 text-sm text-white rounded" onclick="submitCircuitImportString()">OK</button>
    </div>`;
    openModalMenu("Import from string", html);
}

function submitCircuitImportString() {
    let string = document.getElementById("modal-circuit-import-string").value;
    importSerializedCircuit(string);
    closeModalMenu();
}
