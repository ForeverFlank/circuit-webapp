function setup() {
    var canvas = createCanvas(400, 400);
    canvas.parent('canvas-container');

    canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))
}

function draw() {
    mouseCanvasX = (mouseX - controls.view.x) / controls.view.zoom;
    mouseCanvasY = (mouseY - controls.view.y) / controls.view.zoom;
    // console.log(controls.view)
    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom);

    noStroke();
    background(250);
    fill(230);
    for (let y = -500; y <= 500; y += 20) {
        for (let x = -500; x <= 500; x += 20) {
            ellipse(x, y, 5, 5);
        }
    }
    rect(-5, -5, 10, 10);
    stroke(0);
    strokeWeight(2);
    fill(255);

    circuit.modules.forEach((x) => x.render());
}

function mousePressed(e) {
    let pressedOnObject = false;
    for (let i = circuit.modules.length - 1; i >= 0; i--) {
        let module = circuit.modules[i]
        if (module.pressed()) {
            pressedOnObject = true;
            break;
        }
        let nodes = module.inputs.concat(module.outputs);
        for (let j = nodes.length - 1; j >= 0; j--) {
            if (nodes[j].pressed()) {
                pressedOnObject = true;
                break;
            }
        }
    }
    if (pressedOnObject) {

    } else {
        Controls.move(controls).mousePressed(e);
    }    
}

function mouseDragged(e) {
    Controls.move(controls).mouseDragged(e);
}

function mouseReleased(e) {
    circuit.modules.forEach((x) => {
        x.released();
        let nodes = x.inputs.concat(x.outputs);
        nodes.forEach((x) => x.released());
    });
    Controls.move(controls).mouseReleased(e);
}