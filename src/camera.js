var controls = {
    view: { x: 0, y: 0, zoom: 2 },
    viewPos: { prevX: null, prevY: null, isDragging: false },
};
const minZoom = 0.2;
const maxZoom = 5;
class Controls {
    static move(controls) {
        function pressed(e) {
            if (e.type.includes("touch")) e = e.touches[0];
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }

        function dragged(e) {
            /*
            if (e.type.includes('touch')) {
                e = e.touches[0];
                controls.viewPos.isDragging = true;
                controls.viewPos.prevX = e.clientX;
                controls.viewPos.prevY = e.clientY;
            }
            */
            if (e.type.includes("touch")) e = e.touches[0];
            const { prevX, prevY, isDragging } = controls.viewPos;
            if (!isDragging) return;

            const pos = { x: e.clientX, y: e.clientY };
            const dx = pos.x - prevX;
            const dy = pos.y - prevY;

            if (prevX || prevY) {
                controls.view.x += dx;
                controls.view.y += dy;
                (controls.viewPos.prevX = pos.x),
                    (controls.viewPos.prevY = pos.y);
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
            released,
        };
    }

    static zoom(controls) {
        function worldZoom(e) {
            const { x, y, deltaY } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.07;
            const zoom = 1 * direction * factor * controls.view.zoom;
            controls.view.zoom += zoom;
            if (controls.view.zoom < 0.2) {
                controls.view.zoom = 0.2;
            } else if (controls.view.zoom > 5) {
                controls.view.zoom = 5;
            } else {
                const wx =
                    (x - controls.view.x - containerWidth / 2) /
                    (width * controls.view.zoom);
                const wy =
                    (y - controls.view.y - containerHeight / 2) /
                    (height * controls.view.zoom);

                controls.view.x -= wx * width * zoom;
                controls.view.y -= wy * height * zoom;
            }
        }

        return { worldZoom };
    }

    static zoom2(controls) {
        function worldZoom(x, y, deltaY) {
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.07;
            const zoom = 1 * direction * factor * controls.view.zoom;
            controls.view.zoom += zoom;
            if (controls.view.zoom < 0.2) {
                controls.view.zoom = 0.2;
            } else if (controls.view.zoom > 5) {
                controls.view.zoom = 5;
            } else {
                const wx =
                    (x - controls.view.x - containerWidth / 2) /
                    (width * controls.view.zoom);
                const wy =
                    (y - controls.view.y - containerHeight / 2) /
                    (height * controls.view.zoom);

                controls.view.x -= wx * width * zoom;
                controls.view.y -= wy * height * zoom;
            }
        }

        return { worldZoom };
    }

    static setZoom(value) {
        if (value < 0.2) {
            controls.view.zoom = 0.2;
        } else if (value > 5) {
            controls.view.zoom = 5;
        } else {
            controls.view.zoom = value
        }
    }
}
