// create buttons
for(let k in gatesDict) {
    let button = document.createElement('button');
    button.innerHTML = k;
    button.textContent = k;
    button.addEventListener('click', () => addGate(k));
    document.getElementById('gates').appendChild(button);
};

// mouse modes
var mode = 0;
function changeMode(m) {
	console.log(m);
	mode = m;
	canvas.selection = (mode == 2);
}

// renderer section
var canvas = new fabric.Canvas('c');
canvas.perPixelTargetFind = true;
canvas.preserveObjectStacking = true;
canvas.selection = false;

function addGate(name) {
    console.log(name);
    var gate = gatesDict[name];
    console.log(gate);
    var width = gate['width'];
    var height = gate['height'];
    var input = gate['input'];
    var output = gate['output'];

    elements = []
    nodesArray = []

    // placeholder for main hitbox
    var rect = new fabric.Rect({
        left: 0,
        top: 0,
        fill: '#ddd',
        width: width,
        height: height,
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        id: 0
    });
    elements.push(rect);

    // placeholder for textures
    var dummy = new fabric.Rect({
        left: 0,
        top: 0,
        fill: '#ddd',
        width: 0.1,
        height: 0.1,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        id: 0
    });
    
    var text = new fabric.Text(name, {
        fontFamily: 'Consolas',
        fontSize: .8,
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: false,
        id: 0
    });
    elements.push(text);
    
    // nodes = []
    for (let n in input) {
        var nodeIn = new fabric.Rect({
            fill: '#48f',
            width: .5,
            height: .5,
            originX: 'center',
            originY: 'center',
            left: input[n][0] - width/2,
            top: input[n][1] - height/2,
            id: 1
        });
        nodeIn.on('mousedown', function() {
            console.log('Input node clicked!');
        });
        nodeIn.on('mousedown', function() {
            group.set({
                lockMovementX: true,
                lockMovementY: true
            });
        });
        nodeIn.on('mouseup', function() {
            group.set({
                lockMovementX: false,
                lockMovementY: false
            });
        });
        elements.push(nodeIn);
    }
    for (let n in output) {
        var nodeOut = new fabric.Rect({
            fill: '#f80',
            width: .5,
            height: .5,
            originX: 'center',
            originY: 'center',
            left: output[n][0] - width/2,
            top: output[n][1] - height/2,
            id: 1
        });
        nodeOut.on('mousedown', function() {
            console.log('Output node clicked!');
        });
        nodeOut.on('mousedown', function() {
            group.set({
                lockMovementX: true,
                lockMovementY: true
            });
        });
        nodeOut.on('mouseup', function() {
            group.set({
                lockMovementX: false,
                lockMovementY: false
            });
        });
        elements.push(nodeOut);
    }

    var group = new fabric.Group(elements, {
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        lockMovementX: false,
        lockMovementY: false,
        subTargetCheck: true,
        name: name
    });

    group.setControlsVisibility({
        mt: false, 
        mb: false, 
        ml: false, 
        mr: false, 
        bl: false,
        br: false, 
        tl: false, 
        tr: false,
        mtr: false, 
    });

    group.on('moving', function() {
        dummy.set({left: group.left, top: group.top});
    });

    group.on('mousedown', function(options) {
        var selectingName = options.target.get('name');
        // console.log(options.target.get('id'));
        document.getElementById('selecting').innerText = selectingName;
    });
      
    group.on('deselected', function(options) {
        document.getElementById('selecting').innerText = 'None';
    });

    canvas.add(dummy);
    canvas.add(group);
    // console.log(group['_objects'][0])
}

canvas.renderAll();