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
    exportCircuitPrompt();
    document.getElementById('modal-circuit-export-string').value = exportJson;
}

function importSerializedCircuit(string) {
    let importedData = JSON.parse(string);
    let importedModules = importedData["modules"];
    let importedNodes = importedData["nodes"];
    let importedWires = importedData["wires"];

    console.log(importedModules, importedNodes, importedWires);

    /*
    importedWires.forEach((wire) => {
        wire.source = importedNodes.find((node) => wire.sourceId == node.id);
        wire.destination = importedNodes.find(
            (node) => wire.destinationId == node.id
        );
        // console.log('sd', source, destination)
        delete wire.sourceId;
        delete wire.destinationId;
        // return Wire.deserialize(wire, source, destination);
    });

    console.log(importedWires);

    importedModules.forEach((mod) => {
        mod.inputs = mod.inputsId.map((id) =>
            importedNodes.find((node) => id == node.id)
        );
        mod.outputs = mod.outputsId.map((id) =>
            importedNodes.find((node) => id == node.id)
        );
        // console.log("io", inputs, outputs);
        delete mod.inputsId;
        delete mod.outputsId;
        // console.log(mod.name);
        // let newModule = getModuleClassByName(mod.name);
        // newModule.fromSerialized(mod, inputs, outputs);
        // return newModule;
        // return Module.deserialize(mod, inputs, outputs);
    });

    importedNodes.forEach((node) => {
        node.owner = importedModules.find((mod) => node.ownerId == mod.id);
        node.connections = node.connectionsId.map((id) =>
            importedWires.find((wire) => id == wire.id)
        );
        delete node.ownerId;
        delete node.connectionsId;
        // console.log('oc', owner, connections)
        // let newNode = getNodeClassByObject(node);
        // newNode.fromSerialized(node, owner, connections);
        // return newNode;
        // return ModuleNode.deserialize(node, owner, connections);
    });
    */

    let newWires = importedWires.map((wire) => Wire.deserialize(wire));
    let newNodes = importedNodes.map((node) => {
        let newNode = getNodeClassByObject(node);
        newNode.fromSerialized(node);
        return newNode;
    });
    let newModules = importedModules.map((mod) => {
        let newModule = getModuleClassByName(mod.name);
        newModule.fromSerialized(mod);
        return newModule;
    });

    newWires.forEach((wire) => {
        wire.source = newNodes.find((node) => node.id == wire.sourceId);
        wire.destination = newNodes.find(
            (node) => node.id == wire.destinationId
        );
    });
    newNodes.forEach((node) => {
        node.owner = newModules.find((mod) => mod.id == node.ownerId);
        node.connections = node.connectionsId.map((id) =>
            newWires.find((wire) => wire.id == id)
        );
    });
    newModules.forEach((mod) => {
        mod.inputs = mod.inputsId.map((id) =>
            newNodes.find((node) => node.id == id)
        );
        mod.outputs = mod.outputsId.map((id) =>
            newNodes.find((node) => node.id == id)
        );
    });
    console.log("new", newWires, newNodes, newModules);

    // console.log(newModules);
    currentCircuit = Circuit.fromModulesArray(newModules);
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
    let defaultParameters = [null, null, 0, 0, [State.highZ], 0, false];
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
      <p class="text-zinc-600 text-sm">Please paste the exported string in the input box provided.</p>
      <input id="modal-circuit-import-string" class="border p-2 h-8 w-full rounded-sm focus-outline text-sm text-zinc-600"
        type="text" placeholder="" />
    </div>

    <div class="flex flex-row justify-end w-full gap-x-2">
      <button id="modal-cancel" class="bg-white w-20 h-8 text-sm rounded border border-zinc-200" onclick="closeModalMenu()">Cancel</button>
      <button id="modal-submit" class="bg-blue-500 w-20 h-8 text-sm text-white rounded" onclick="submitCircuitImportString()">Import</button>
    </div>`;
    openModalMenu("Import from text", html);
}

function submitCircuitImportString() {
    let string = document.getElementById("modal-circuit-import-string").value;
    importSerializedCircuit(string);
    closeModalMenu();
}

function exportCircuitPrompt() {
    let html = `
    <div class="flex flex-col gap-y-2">
      <p class="text-zinc-600 text-sm">Please copy the exported string below and save it somewhere safe:</p>
      <input id="modal-circuit-export-string" class="border p-2 h-8 w-full rounded-sm focus-outline text-sm text-zinc-600"
        type="text" placeholder="" />
    </div>

    <div class="flex flex-row justify-end w-full gap-x-2">
      <button id="modal-submit" class="bg-blue-500 w-20 h-8 text-sm text-white rounded" onclick="closeModalMenu()">Close</button>
    </div>`;
    openModalMenu("Export to text", html);
}
