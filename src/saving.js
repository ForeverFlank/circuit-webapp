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
    // pushAlert("info", "Copied export data to clipboard!")
    navigator.clipboard.writeText(exportJson);
    console.log(exportJson);
    console.log("!!! Export !!!");
    exportCircuitPrompt();
    document.getElementById("modal-circuit-export-string").value = exportJson;
}

function importSerializedCircuit(string) {
    let importedData = JSON.parse(string);
    let importedModules = importedData["modules"];
    let importedNodes = importedData["nodes"];
    let importedWires = importedData["wires"];

    console.log(importedModules, importedNodes, importedWires);

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
    currentCircuit.evaluateAll();
    pushAlert('info', 'Successfully loaded the circuit.')
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
        case "Tri-State Buffer":
            return new TriStateBuffer();
        case "OR Gate":
            return new OrGate();
        case "NOR Gate":
            return new NorGate();
        case "AND Gate":
            return new AndGate();
        case "NAND Gate":
            return new NandGate();
        case "XOR Gate":
            return new XorGate();
        case "XNOR Gate":
            return new XnorGate();

        case "1-to-2 Decoder":
            return new Decoder1To2();
        case "2-to-4 Decoder":
            return new Decoder2To4();
        case "3-to-8 Decoder":
            return new Decoder3To8();

        case "Half Adder":
            return new HalfAdder();
        case "Full Adder":
            return new FullAdder();

        case "SR Latch":
            return new SRLatch();
        case "D Latch":
            return new DLatch();
        case "T Flip Flop":
            return new TFlipFlop();
        case "JK Flip Flop":
            return new JKFlipFlop();

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
      <p class="text-zinc-600 text-sm">[EXPERIMENTAL] Please paste the exported string in the input box provided.</p>
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
      <p class="text-zinc-600 text-sm">Exported data saved on clipboard, or copy the exported string below and save it somewhere safe:</p>
      <input id="modal-circuit-export-string" class="border p-2 h-8 w-full rounded-sm focus-outline text-sm text-zinc-600"
        type="text" placeholder="" />
    </div>

    <div class="flex flex-row justify-end w-full gap-x-2">
      <button id="modal-submit" class="bg-blue-500 w-20 h-8 text-sm text-white rounded" onclick="closeModalMenu()">Close</button>
    </div>`;
    openModalMenu("Export to text", html);
}
