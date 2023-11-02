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

let isPortStart = false, isPortEnd = false;
let nodeStart, nodeEnd;

let wireStyle = { fill: '#000', stroke: '#000', strokeWidth: .2,
selectable: false, evented: false };
let wirePreviewStyle = { stroke: '#888', strokeWidth: .2,
selectable: false, evented: false };

let wireNodeStyle = {
    radius: .2,
    fill: '#000',
    originX: 'center',
    originY: 'center',
    hasControls: false,
    lockMovementX: false,
    lockMovementY: false,
    id: 'wireNode'
};

canvas.on('mouse:down', function(opt) {
    // console.log('down');
    console.log(opt);
    isPortStart = false;
    isPortEnd = false;
    nodeStart = null;
    nodeEnd = null;
    let isNull = opt.target == null;
    let isGate = false;
    let isWireNode = false;
    if (!isNull) {
        isGate = opt.target.id == 'gate';
        isWireNode = opt.target.id == 'wireNode';
        if (isGate) {
            isPortStart = opt.subTargets[0].id == 'portIn' || 
                          opt.subTargets[0].id == 'portOut';
        }
        isPortStart = isPortStart || isWireNode;
    }
    let isValid = isNull ||
                  !isGate ||
                  (isGate && isPortStart);
    if (mode == 'wire' && isValid) {
        let pointer = canvas.getPointer(opt.e);
        let posX = pointer.x;
        let posY = pointer.y;
        console.log(posX, posY);
        isDrawingWire = true;
        wireStartX = Math.round(posX);
        wireStartY = Math.round(posY);
    }
});

let tempX = 0, tempY = 0;
let tempWire;
canvas.on('mouse:move', function(opt) {
    if (isDrawingWire) {
        let pointer = canvas.getPointer(opt.e);
        let newX = Math.round(pointer.x);
        let newY = Math.round(pointer.y);
        // console.log(newX, newY, tempX, tempY)
        if (newX != tempX || newY != tempY) {
            canvas.remove(tempWire);
            tempX = newX;
            tempY = newY;
            tempWire = new fabric.Line([wireStartX, wireStartY, tempX, tempY], wirePreviewStyle);
            canvas.add(tempWire);
        }
    }
});

canvas.on('mouse:up', function(opt) {
    // console.log('up');
    console.log(opt);
    let isNull = opt.currentTarget == null;
    let isGate = false;
    let isWireNode = false;
    if (!isNull) {
        isGate = opt.currentTarget.id == 'gate';
        isWireNode = opt.currentTarget.id == 'wireNode';
        if (isGate) {
            isPortEnd = opt.currentSubTargets[0].id == 'portIn' || 
                        opt.currentSubTargets[0].id == 'portOut';
        }
        isPortEnd = isPortEnd || isWireNode;
    }
    if (isDrawingWire) {
        canvas.remove(tempWire);
        isDrawingWire = false;
        let pointer = canvas.getPointer(opt.e);
        let posX = pointer.x;
        let posY = pointer.y;
        wireEndX = Math.round(posX);
        wireEndY = Math.round(posY);
        console.log(isPortStart, isPortEnd)
        if (!isPortStart) {
            nodeStart = new fabric.Circle(Object.assign({},
                {
                    left: wireStartX,
                    top: wireStartY,
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    lockMovementX: false,
                    lockMovementY: false,
                },
                wireNodeStyle));
            canvas.add(nodeStart);
            circuit.addNode(new Node('wire', nodeStart));
        }
        if (!isPortEnd) {
            nodeEnd = new fabric.Circle(Object.assign({},
                {
                    left: wireEndX,
                    top: wireEndY,
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    lockMovementX: false,
                    lockMovementY: false,
                },
                wireNodeStyle));
            canvas.add(nodeEnd);
            circuit.addNode(new Node('wire', nodeEnd));
        }

        
        canvas.add(new fabric.Line([wireStartX, wireStartY, wireEndX, wireEndY], wireStyle));

        console.log(circuit);
    }
});