p5.disableFriendlyErrors = true;

function windowResized() {
    containerWidth = getContainerWidth();
    containerHeight = getContainerHeight();
    resizeCanvas(containerWidth, containerHeight);
}

function timingDiagram(xPos, yPos) {
    let nodes = currentCircuit.getNodes();
    xPos = 220;
    yPos = 500 - nodes.length * 15;
    push();
    fill(0);
    rect(xPos, yPos, 400, 30 + nodes.length * 15);

    fill(255);
    for (let i = 0; i <= 10; i += 1) {
        text(i, 50 + xPos + 20 * i, yPos + 30 + nodes.length * 15);
    }

    let i = 1;
    nodes.forEach((x) => {
        fill(255);
        noStroke();
        text(x.name, xPos + 5, yPos + 15 * i++);
        noFill();
        stroke(255);
        strokeWeight(1);
        line(xPos + 45, yPos + 15 * i - 20, xPos + 45, yPos + 15 * i - 25);

        for (let t = 0; t <= 10; t += 0.2) {
            // console.log(x.getValue(t))
            let value = x.getValue(t);
            let color = value == null ? 255 : State.color(value);
            stroke(color);
            value = value >= 0 ? value : 0;
            beginShape();
            vertex(xPos + t * 20 + 50, yPos + 15 * i + value * -5 - 20);
            vertex(xPos + t * 20 + 54, yPos + 15 * i + value * -5 - 20);
            endShape();
        }
    });
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
}

function draw() {
    mouseUpdate();
    placeX = -Math.round(controls.view.x / 20 / controls.view.zoom) * 20;
    placeY = -Math.round(controls.view.y / 20 / controls.view.zoom) * 20;
    hoveringNode = {};

    mainRender();
    
    let fps = frameRate();
    document.getElementById("fps-counter").innerText = 'FPS: ' + fps.toFixed(0);
}

// new p5(sketch);