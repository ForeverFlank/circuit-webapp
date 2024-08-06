import { unique } from "../custom-uuid.js";
import { State } from "./state.js";
import { Editor } from "../editor/editor.js";
import { mainContainer } from "../main.js";
import * as Constants from "../constants.js";

class Wire {
    constructor(source, destination, rendered = true, name = "") {
        this.name = "Wire";
        this.source = source;
        this.destination = destination;
        this.rendered = rendered;
        this.isSubModuleWire = false;
        this.id = unique(name);
        this.isHovering = false;
        this.objectType = "wire";
    }
    hovering(e) {
        if (Editor.controlMode == "pan") return false;
        if (Editor.isPointerHoveringOnDiv(e)) return false;
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();

        const distance = (u, v) => Math.sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
        const sub = (u, v) => {
            return { x: u.x - v.x, y: u.y - v.y };
        };
        const mag = (v) => distance(v, { x: 0, y: 0 });
        const angle = (u, v) =>
            Math.acos((u.x * v.x + u.y * v.y) / (mag(u) * mag(v)));

        const a = { x: sourceX, y: sourceY };
        const b = { x: destinationX, y: destinationY };
        const c = {
            x: Editor.pointerPosition.x,
            y: Editor.pointerPosition.y
        };

        const l = mag(sub(a, b));
        const radius = Constants.NODE_HOVERING_RADIUS;

        if (
            distance(a, c) > l + radius / 2 ||
            distance(b, c) > l + radius / 2
        ) {
            return false;
        }

        const ab = sub(a, b);
        const bc = sub(b, c);

        return Math.abs(Math.sin(angle(ab, bc))) * mag(bc) <= radius / 2;
    }
    setDirection(from, to) {
        if (this.isSplitterConnection()) return;
        this.rendered = from.id == this.source.id;
        let hiddenWire = to.connections.find(
            (x) => x.destination.id == from.id
        );
        hiddenWire.rendered = !(from.id == this.source.id);
    }
    isSplitterConnection() {
        if (!this.source.isSplitterNode()) return false;
        if (!this.destination.isSplitterNode()) return false;
        if (this.source.owner.id != this.destination.owner.id) return false;
        if (this.source.isSplitterInput == this.destination.isSplitterInput)
            return false;
        return true;
    }
    render(obj = {}) {
        if (!this.rendered) return;
        if (this.isSubModuleWire && !DEBUG_2) return;
        if (this.graphics == null) {
            this.graphics = new PIXI.Graphics()
            this.graphics.eventMode = "static";
            const sourceX = this.source.getCanvasX();
            const sourceY = this.source.getCanvasY();
            const destinationX = this.destination.getCanvasX();
            const destinationY = this.destination.getCanvasY();
            // console.log(sourceX, sourceY, destinationX, destinationY)
            this.graphics.moveTo(sourceX, sourceY);
            this.graphics.lineTo(destinationX, destinationY);
            this.graphics.stroke({
                color: 0xffffff,
                width: 4
            });
            mainContainer.addChild(this.graphics);
        }
        if (obj.rerender) {
            this.graphics.clear();
            const sourceX = this.source.getCanvasX();
            const sourceY = this.source.getCanvasY();
            const destinationX = this.destination.getCanvasX();
            const destinationY = this.destination.getCanvasY();
            // console.log(sourceX, sourceY, destinationX, destinationY)
            this.graphics.moveTo(sourceX, sourceY);
            this.graphics.lineTo(destinationX, destinationY);
            this.graphics.stroke({
                color: 0xffffff,
                width: 4
            });
        }

        let color;
        if (this.source.getValueAtTime(Infinity).length == 1) {
            color = State.color(this.source.getValueAtTime(Infinity)[0]);
        } else {
            if (
                this.source
                    .getValueAtTime(Infinity)
                    .every((x) => x == State.highZ)
            ) {
                color = State.color(State.highZ);
            } else {
                color = 0x404040;
            }
        }
        this.graphics.tint = color;

        /*
        let sourceX = this.source.getCanvasX();
        let sourceY = this.source.getCanvasY();
        let destinationX = this.destination.getCanvasX();
        let destinationY = this.destination.getCanvasY();

        let length = Math.sqrt(
            (sourceX - destinationX) ** 2 + (sourceY - destinationY) ** 2
        );
        let angle = Math.atan2(destinationY - sourceY, destinationX - sourceX);

        push();

        noStroke();
        if (this.source.getValueAtTime(Infinity).length == 1) {
            fill(State.color(this.source.getValueAtTime(Infinity)[0]));
        } else {
            if (
                this.source
                    .getValueAtTime(Infinity)
                    .every((x) => x == State.highZ)
            ) {
                fill(State.color(State.highZ));
            } else {
                fill(64);
            }
        }

        translate((destinationX + sourceX) / 2, (destinationY + sourceY) / 2);
        rotate(angle);

        let width = this.hovering() ? 6 : 4;
        rect(-length / 2, -width / 2, length, width);
        pop();

        push();
        textSize(8);
        textAlign(CENTER, CENTER);

        let isStateHigh =
            this.source.getValueAtTime(Infinity) == State.high ||
            this.destination.getValueAtTime(Infinity) == State.high;
        let isNBit =
            this.source.getValueAtTime(Infinity).length > 1 ||
            this.destination.getValueAtTime(Infinity).length > 1;
        if (isStateHigh || isNBit) {
            push();
            noStroke();
            let value = this.source.getValueAtTime(Infinity);
            let dotDistance = 0;
            let speed = 0;
            if (value.length == 1) {
                dotDistance = 20;
                speed = 100;
                fill(color(255, 255, 0));
            } else {
                dotDistance = 60;
                speed = 50;
                fill(0);
            }
            let dotCount = Math.round(length / dotDistance);
            for (let i = 0; i < dotCount; i++) {
                let t =
                    ((speed * Date.now()) / (length * 1000) + i / dotCount) % 1;
                let deltaX = destinationX - sourceX;
                let deltaY = destinationY - sourceY;
                if (value.length == 1) {
                    circle(sourceX + deltaX * t, sourceY + deltaY * t, 4);
                } else {
                    push();
                    let str = State.toString(value);
                    let bbox = fontRegular.textBounds(
                        str,
                        sourceX + deltaX * t,
                        sourceY + deltaY * t - 16
                    );
                    fill("#f4f4f5");
                    rect(
                        bbox.x - 2,
                        bbox.y + 12,
                        bbox.w + 2 * 2,
                        bbox.h + 2 * 2
                    );
                    fill(0);
                    text(str, sourceX + deltaX * t, sourceY + deltaY * t - 1);
                    pop();
                }
            }
            pop();
        }
        pop();
        */
    }
    pressed(e) {
        this.isHovering = this.hovering(e);
        if (!this.rendered) {
            return false;
        }
        if (this.isHovering) {
            pressedWire = this;
            if (mouseButton == RIGHT) {
                return this.remove();
            }
        }
        return false;
    }
    remove() {
        this.source.disconnect(this.destination);
        let otherWire = this.destination.connections.find(
            (x) => x.destination.id == this.id
        );
        if (otherWire != null) {
            otherWire.remove();
        }
        return this;
    }
    serialize() {
        return {
            id: this.id,
            objectType: this.objectType,
            sourceId: this.source.id,
            destinationId: this.destination.id,
            rendered: this.rendered,
            isSubmoduleWire: this.isSubModuleWire,
        };
    }
    static deserialize(data, source, destination) {
        let newWire = new Wire();
        newWire.id = data.id;
        newWire.objectType = data.objectType;
        newWire.rendered = data.rendered;
        newWire.isSubModuleWire = data.isSubModuleWire;
        newWire.sourceId = data.sourceId;
        newWire.destinationId = data.destinationId;
        // newWire.source = source;
        // newWire.destination = destination;
        return newWire;
    }
}

export { Wire }