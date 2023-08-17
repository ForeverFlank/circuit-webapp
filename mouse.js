// canvas zoom
var zoom = 20;
canvas.zoomToPoint({ x: -12.5, y: -12.5 }, zoom);
canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 50) zoom = 50;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
});

//grid
var grid = 1;
var gridStyle = { stroke: '#ccc',
                  strokeWidth: .05,
                  selectable: false,
                  evented: false }
// display grid
for (var i = 0; i < (600 / grid); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, 600], gridStyle));
    canvas.add(new fabric.Line([ 0, i * grid, 600, i * grid], gridStyle))
  }

// snap to grid
canvas.on('object:moving', function(options) {
	var target = options.target;
	var rect = options.target['_objects'][0];
	// console.log(rect);
	// console.log(rect.left, rect.top);
	// console.log(rect._getLeftTopCoords());
    // console.log(options.target.left, options.target.top);
    if (Math.round(rect.left / grid * 1) % 1 == 0 &&
		Math.round(rect.top / grid * 1) % 1 == 0) {
		target.set({
			left: Math.round(target.left / grid) * grid + .0 - rect.left - (rect.width/2)%1,
			top: Math.round(target.top / grid) * grid + .0 - rect.top - (rect.height/2)%1
		}).setCoords();
    }
	console.log(Math.round(target.left - 1), Math.round(target.top - 1));
});

