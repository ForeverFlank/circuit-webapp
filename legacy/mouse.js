//grid
let gridStyle = { stroke: '#ccc', strokeWidth: .05,
                  selectable: false, evented: false }
let gridStyleBold = { stroke: '#ccc', strokeWidth: .1,
                  selectable: false, evented: false }
// display grid
for (let i = -500; i < 500; i++) {
    canvas.add(new fabric.Line([i, -500, i, 500], gridStyle));
    canvas.add(new fabric.Line([-500, i, 500, i], gridStyle));
}
canvas.add(new fabric.Line([0, -500, 0, 500], gridStyleBold));
canvas.add(new fabric.Line([-500, 0, 500, 0], gridStyleBold));

// snap to grid
canvas.on('object:moving', function(opt) {
	let target = opt.target;
	let rect = opt.target['_objects'][0];
	// console.log(rect);
	// console.log(rect.left, rect.top);
	// console.log(rect._getLeftTopCoords());
    // console.log(options.target.left, options.target.top);
    if (Math.round(rect.left * 1) % 1 == 0 &&
		Math.round(rect.top * 1) % 1 == 0) {
		target.set({
			left: Math.round(target.left) - rect.left - (rect.width/2)%1,
			top: Math.round(target.top) - rect.top - (rect.height/2)%1
		}).setCoords();
    }
	// console.log(Math.round(target.left - 1), Math.round(target.top - 1));
});

let isDrawingWire = false;
let wireStartX = 0, wireStartY = 0;
let wireEndX = 0, wireEndY = 0;

let wireStyle = { stroke: '#000', strokeWidth: .2,
                  selectable: false, evented: false }

canvas.on('mouse:down', function(opt) {
	console.log('Mouse down');
	if (mode == 0/* && opt.target === null*/) {
		let pointer = canvas.getPointer(opt.e);
		let posX = pointer.x;
		let posY = pointer.y;
		console.log(posX, posY);
		isDrawingWire = true;
		wireStartX = Math.round(posX);
		wireStartY = Math.round(posY);
	}
});

canvas.on('mouse:up', function(opt) {
	if (isDrawingWire) {
		isDrawingWire = false;
		let pointer = canvas.getPointer(opt.e);
		let posX = pointer.x;
		let posY = pointer.y;
		console.log(posX, posY);
		wireEndX = Math.round(posX);
		wireEndY = Math.round(posY);
		// let midpoint
		canvas.add(new fabric.Line([wireStartX, wireStartY, wireEndX, wireEndY], wireStyle));
	}
});