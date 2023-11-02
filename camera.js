// zooming
let zoom = 20;
canvas.zoomToPoint({ x: -12.5, y: -10 }, zoom);
canvas.on('mouse:wheel', function(opt) {
    let delta = opt.e.deltaY;
    zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 50) zoom = 50;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
});

// panning
canvas.on('mouse:down', function(opt) {
    var evt = opt.e;
    if (mode == 'pan') {
        this.isDragging = true;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
    }
});
canvas.on('mouse:move', function(opt) {
    if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
    }
});
canvas.on('mouse:up', function(opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
});