function mainRender() {
    background("#f4f4f5");
    push();
    translate(width / 2, height / 2);
    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom);

    grid();

    let nodes = [];
    currentCircuit.modules.forEach((x) => {
        nodes = nodes.concat(x.inputs).concat(x.outputs);
    });
    let wires = [];
    nodes.forEach((x) => {
        wires = wires.concat(x.connections);
    });

    nodes.forEach((x) => x.renderPin());
    currentCircuit.modules.forEach((x) => {
        x.render();
    });
    wires.forEach((x) => x.render());
    nodes.forEach((x) => x.render());

    if (Object.keys(hoveringNode).length != 0) {
        nodeHint();
    }

    pop();
}