/*
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

function nodeHint() {
    push();
    let x = hoveringNode.relativeX * 20 + hoveringNode.owner.x;
    let y = hoveringNode.relativeY * 20 + hoveringNode.owner.y;
    let margin = 3;
    textAlign(CENTER, CENTER);
    let bbox = fontRegular.textBounds(hoveringNode.name, x, y - 16);
    fill(240);
    rect(
        bbox.x - margin,
        bbox.y - margin,
        bbox.w + margin * 2,
        bbox.h + margin * 2
    );
    fill(0);
    text(hoveringNode.name, x, y - 16);
    pop();

    if (DEBUG) {
        push();
        textAlign(CENTER, CENTER);
        fill(0);
        let debugString;
        debugString = Object.entries(hoveringNode.valueAtTime).map((x) => {
            let key = x[0];
            let value = x[1];
            return `${key}:${value}`
        }).join(' | ')
        text(debugString, x, y - 32);
        debugString = Object.entries(hoveringNode.isHighZAtTime).map((x) => {
            let key = x[0];
            let value = x[1];
            return `${key}:${value}`
        }).join(' | ')
        text(debugString, x, y - 44);
        pop();
    }
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
*/