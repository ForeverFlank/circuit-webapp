import { preloadTextures } from "./init.js";
import { CanvasContainer } from "./classes/canvas.js";
import { EventHandler } from "./event/event-handler.js";
import { Editor } from "./editor/editor.js";
import { Circuit } from "./classes/circuit.js"
import { createGateMenuButtons } from "./gate-menu-buttons.js";
import { Input } from "./classes/module.js";
import { NotGate } from "./gates/basic.js";
import { gridGraphics, drawGrid } from "./renderer/grid.js";
// import { renderGrid } from "./renderer/grid.js";

preloadTextures();
createGateMenuButtons();

var currentCircuit = new Circuit({ name: "Circuit" });
export { currentCircuit }
for (let i = 0; i < 1; ++i) NotGate.add();
// let notGate = new NotGate({ name: "not1" })
// notGate.x = 20;
// notGate.y = 20;
// currentCircuit.addModule(notGate)

// EventHandler.add('mousedown', () => console.log("down"))
// EventHandler.add('mousemove', () => console.log("move"))

let mainCanvasContainer = new CanvasContainer();
export { mainCanvasContainer }
const canvasStyle = {
    backgroundColor: "#f4f4f5",
};

const app = new PIXI.Application();
const mainContainer = new PIXI.Container({
    isRenderGroup: true,
});
export { mainContainer };

await app.init({
    width: mainCanvasContainer.getContainerWidth(),
    height: mainCanvasContainer.getContainerHeight(),
    backgroundColor: canvasStyle.backgroundColor,
    antialias: true,
});
document.getElementById("canvas-container").appendChild(app.canvas);

mainContainer.x = mainCanvasContainer.getContainerWidth() / 2;
mainContainer.y = mainCanvasContainer.getContainerHeight() / 2;
app.stage.addChild(mainContainer);
Editor.container = mainContainer;
Editor.position.x = mainContainer.x;
Editor.position.y = mainContainer.y;
Editor.wireDrawingGraphics = new PIXI.Graphics();
Editor.wireDrawingGraphics.eventMode = "static";
mainContainer.addChild(Editor.wireDrawingGraphics);

await PIXI.Assets.load("./src/sample.png");
let sprite = PIXI.Sprite.from("./src/sample.png");
// mainContainer.addChild(sprite);
mainContainer.addChild(gridGraphics);

const graphics = new PIXI.Graphics();
graphics.eventMode = "static";
// mainContainer.addChild(graphics);

let elapsed = 0.0;
let i = 0;

app.ticker.add((ticker) => {
    drawGrid();
/*
    graphics.clear();
    graphics.star(0, 0, 4, 10);
    graphics.fill(0x888888);
    graphics.star(0, 20, 4, 10);
    graphics.fill(0x00ff00);
    graphics.star(20, 0, 4, 10);
    graphics.fill(0xff0000);
*/
    for (let i = currentCircuit.modules.length - 1; i >= 0; --i) {
        let mod = currentCircuit.modules[i];
        mod.render({
            graphics: graphics
        });
        let inputs = mod.inputs;
        let outputs = mod.outputs;

        function renderWire(node) {
            let wires = node.connections;
            for (let k = wires.length - 1; k >= 0; --k) {
                wires[k].render();
                wires[k].parallelWire.render();
            }
        }
        for (let j = inputs.length - 1; j >= 0; --j) {
            let node = inputs[j];
            renderWire(node);
            node.render();
        }
        for (let j = outputs.length - 1; j >= 0; --j) {
            let node = outputs[j];
            renderWire(node);
            node.render();
        }
    }

    elapsed += ticker.deltaTime;
    sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
    i++;

    document.getElementById("fps-counter").innerText = Math.round(ticker.FPS);
});

/*
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

function draw() {
    
    mouseUpdate();
    cameraCenterX = -Math.round(controls.view.x / 20 / controls.view.zoom) * 20;
    cameraCenterY = -Math.round(controls.view.y / 20 / controls.view.zoom) * 20;
    hoveringNode = {};

    mainRender();

    let fps = frameRate();
    // document.getElementById("fps-counter").innerText = "FPS: " + fps.toFixed(0);
    
}

// new p5(sketch);
*/
