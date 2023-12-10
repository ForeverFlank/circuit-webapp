/// <reference path="../node_modules/@types/p5/global.d.ts" />
// import { containerWidth, containerHeight } from "./classes";

function containerWidth() {
    return document.getElementById('canvas-container').clientWidth; }
function containerHeight() {
    return document.getElementById('canvas-container').clientHeight; }

var controls = {
    view: {x: 0, y: 0, zoom: 1},
    viewPos: { prevX: null, prevY: null, isDragging: false },
}

class Controls {
    static move(controls) {
        function pressed(e) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }

        function dragged(e) {
            const { prevX, prevY, isDragging } = controls.viewPos;
            if (!isDragging) return;

            const pos = { x: e.clientX, y: e.clientY };
            const dx = pos.x - prevX;
            const dy = pos.y - prevY;

            if (prevX || prevY) {
                controls.view.x += dx;
                controls.view.y += dy;
                controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
            }
        }

        function released(e) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = null;
            controls.viewPos.prevY = null;
        }

        return {
            pressed,
            dragged,
            released
        }
    }

    static zoom(controls) {

        function worldZoom(e) {
            const { x, y, deltaY } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.06;
            const zoom = direction * factor * controls.view.zoom;

            const wx = (x - controls.view.x - containerWidth() / 2) / (width * controls.view.zoom);
            const wy = (y - controls.view.y - containerHeight() / 2) / (height * controls.view.zoom);

            controls.view.x -= wx * width * zoom;
            controls.view.y -= wy * height * zoom;
            controls.view.zoom += zoom;
        }

        return { worldZoom }
    }
}