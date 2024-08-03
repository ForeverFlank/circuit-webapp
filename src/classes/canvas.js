class CanvasContainer {
    constructor(id = "canvas-container") {
        this.id = id;
    }
    getContainerWidth() {
        return document.getElementById(this.id).clientWidth;
    }
    getContainerHeight() {
        return document.getElementById(this.id).clientHeight;
    }
}

export { CanvasContainer };
