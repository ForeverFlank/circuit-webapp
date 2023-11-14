let controls = {
    view: {x: 0, y: 0, zoom: 1},
    viewPos: { prevX: null,  prevY: null,  isDragging: false },
}

class Controls {
    static move(controls) {
        function mousePressed(e) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }

        function mouseDragged(e) {
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

        function mouseReleased(e) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = null;
            controls.viewPos.prevY = null;
        }

        return {
            mousePressed,
            mouseDragged,
            mouseReleased
        }
    }

    static zoom(controls) {
        // function calcPos(x, y, zoom) {
        //   const newX = width - (width * zoom - x);
        //   const newY = height - (height * zoom - y);
        //   return {x: newX, y: newY}
        // }

        function worldZoom(e) {
            const { x, y, deltaY } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.06;
            const zoom = 1 * direction * factor * controls.view.zoom;

            const wx = (x - controls.view.x) / (width * controls.view.zoom);
            const wy = (y - controls.view.y) / (height * controls.view.zoom);

            controls.view.x -= wx * width * zoom;
            controls.view.y -= wy * height * zoom;
            controls.view.zoom += zoom;
        }

        return { worldZoom }
    }
}