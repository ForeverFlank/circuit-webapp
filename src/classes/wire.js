class Wire {
    constructor(source, destination, rendered = true, name = '') {
        this.source = source;
        this.destination = destination;
        this.rendered = rendered;
        this.id = unique(name);
        this.isHovering = false;
    }
    hovering() {
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();

        const distance = (u, v) => sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
        const sub = (u, v) => { return { x: u.x - v.x, y: u.y - v.y } };
        const mag = (v) => distance(v, { x: 0, y: 0 });
        const angle = (u, v) => acos((u.x * v.x + u.y * v.y) / (mag(u) * mag(v)));

        const a = { x: sourceX, y: sourceY };
        const b = { x: destinationX, y: destinationY };
        const c = { x: mouseCanvasX, y: mouseCanvasY };

        const l = mag(sub(a, b));
        const radius = NODE_HOVERING_RADIUS;

        if (distance(a, c) > l + radius / 2 || distance(b, c) > l + radius / 2) {
            return false;
        }

        const ab = sub(a, b);
        const bc = sub(b, c);

        return abs(sin(angle(ab, bc))) * mag(bc) <= radius / 2;
    }
    setDirection(from, to) {
        this.rendered = (from.id == this.source.id);
        let hiddenWire = to.connections.find((x) => x.destination.id == from.id);
        hiddenWire.rendered = !(from.id == this.source.id);
    }
    render() {
        if (!this.rendered) return;

        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();

        let length = sqrt((sourceX - destinationX) ** 2 + (sourceY - destinationY) ** 2);
        let angle = atan2(destinationY - sourceY, destinationX - sourceX);

        push();
        stroke(0);
        strokeWeight(2);
        fill(State.color(this.source.value));
        translate((destinationX + sourceX) / 2, (destinationY + sourceY) / 2);
        rotate(angle);
        let width = this.hovering() ? 10 : 6;
        rect(-length / 2, -width / 2, length, width);
        pop();
        if (!(this.source.value == State.highZ &&
            this.destination.value == State.highZ)) {
            push();
            noStroke();
            fill(color(255, 255, 0));
            const dotDistance = 20;
            const speed = 2;
            let dotCount = Math.floor(length / dotDistance);
            for (let i = 0; i < dotCount; i++) {
                let t = (speed * Date.now() / (length * dotDistance) + i / dotCount) % 1;
                let deltaX = destinationX - sourceX;
                let deltaY = destinationY - sourceY;
                circle(sourceX + deltaX * t, sourceY + deltaY * t, 5);
            }
            pop();
        }
    }
    pressed() {
        this.isHovering = this.hovering();
        if (!this.rendered) return;
        if (this.isHovering) {
            if (mouseButton == RIGHT) {
                this.source.disconnect(this.destination);
                return this;
            }
        }
        return false;
    }
}