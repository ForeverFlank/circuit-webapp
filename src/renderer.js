var canvas;
function setup() {
    canvas = createCanvas(containerWidth, containerHeight);
    canvas.parent("canvas-container");
    textFont(fontRegular);
}

function grid() {
    let view = controls.view;
    let width = containerWidth;
    let height = containerHeight;
    let roundedWidth = 40 * ceil(width / 40);
    let roundedHeight = 40 * ceil(height / 40);
    let zoom = view.zoom;
    push();
    noStroke();

    stroke("#e4e4e7");
    strokeWeight(1);
    let startX = floor((-view.x - roundedWidth / 2) / 20 / zoom) * 20;
    let startY = floor((-view.y - roundedHeight / 2) / 20 / zoom) * 20;
    let endX = ceil((-view.x + roundedWidth / 2) / 20 / zoom) * 20;
    let endY = ceil((-view.y + roundedHeight / 2) / 20 / zoom) * 20;
    for (let x = startX; x <= endX; x += 20) {
        line(x, startY, x, endY);
    }
    for (let y = startY; y <= endY; y += 20) {
        line(startX, y, endX, y);
    }
    pop();
}

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