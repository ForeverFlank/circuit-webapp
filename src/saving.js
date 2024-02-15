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
    let importData = JSON.parse(string);
    console.log(importData);
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
