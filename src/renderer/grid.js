import { Editor } from "../editor/editor.js";
import { GRID_SIZE } from "../constants.js";

const gridGraphics = new PIXI.Graphics();

/*
let roundedWidth = 40 * ceil(width / 40);
let roundedHeight = 40 * ceil(height / 40);
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
*/

function drawGrid() {
  gridGraphics.clear();

  const position = Editor.position;
  const zoom = Editor.zoom;
  
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const roundedWidth = 40 * Math.ceil(width / 40);
  const roundedHeight = 40 * Math.ceil(height / 40);

  const startX = Math.floor((-position.x - roundedWidth) / (GRID_SIZE * zoom)) * GRID_SIZE;
  const startY = Math.floor((-position.y - roundedHeight) / (GRID_SIZE * zoom)) * GRID_SIZE;
  const endX = Math.floor((-position.x + roundedWidth) / (GRID_SIZE * zoom)) * GRID_SIZE;
  const endY = Math.floor((-position.y + roundedHeight) / (GRID_SIZE * zoom)) * GRID_SIZE;
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    gridGraphics.moveTo(x, startY);
    gridGraphics.lineTo(x, endY);
    gridGraphics.stroke({
      width: 2,
      color: 0xeeeeee
    });
  }
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    gridGraphics.moveTo(startX, y);
    gridGraphics.lineTo(endX, y);
    gridGraphics.stroke({
      width: 2,
      color: 0xeeeeee
    });
  }
}

export { gridGraphics, drawGrid }