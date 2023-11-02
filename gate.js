var gateCount = {};

for(let k in gatesDict) {
    let button = document.createElement('button');
    button.innerHTML = k;
    button.textContent = k;
    button.addEventListener('click', () => addGate(k));
    document.getElementById('gates').appendChild(button);
    gateCount[k] = 0;
};
gateCount['wire'] = 0
console.log(gateCount);

// circuit structure
class Node {
    constructor(name, fo) {
        this.gate = gatesDict[name];
        if (name != 'wire') {
            this.fo = fo;
            let input = this.gate['input'];
            let output = this.gate['output'];
            function port(io, n) {
                let arr = [];
                for (let i = 0; i < n; i++)
                    arr.push(io + i)
                return arr;
            }
            this.in = port('in', input.length);
            this.out = port('out', output.length);
        }
        else {
            this.in = 'in0';
            this.out = 'out0';
        }
        this.id = name + gateCount[name];
        gateCount[name]++;
    }
}

class Edge {
    constructor(from, fromPort, to, toPort) {
        this.from = from;
        this.fromPort = fromPort
        this.to = to;
        this.toPort = toPort;
    }
}

class Circuit {
    constructor(subcircuit=false) {
        this.subcircuit = subcircuit;
        this.nodes = [];
        this.edges = [];
    }
    addNode(node) {
        this.nodes.push(node);
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
}

var circuit = new Circuit();

// renderer section
var canvas = new fabric.Canvas('c');
canvas.perPixelTargetFind = true;
canvas.preserveObjectStacking = true;

// mouse modes
var mode = 'select';
function changeMode(m) {
	console.log(m);
	mode = m;
    canvas.selectable = (mode != 'pan')
	canvas.selection = (mode == 'select');
}
changeMode('select');

const noVisibility = {
    mt: false, 
    mb: false, 
    ml: false, 
    mr: false, 
    bl: false,
    br: false, 
    tl: false, 
    tr: false,
    mtr: false, 
};

function addGate(name) {
    console.log(name);
    var gate = gatesDict[name];
    console.log(gate);
    var displayName = gate['displayName'];
    var width = gate['width'];
    var height = gate['height'];
    var input = gate['input'];
    var output = gate['output'];

    elements = []
    portsArray = []

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
    
    var text = new fabric.Text(displayName, {
        fontFamily: 'Consolas',
        fontSize: .5,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        id: 0
    });
    elements.push(text);
    
    for (let n in input) {
        var portIn = new fabric.Rect({
            fill: '#48f',
            width: 1,
            height: 1,
            originX: 'center',
            originY: 'center',
            left: input[n][0] - width/2,
            top: input[n][1] - height/2,
            id: 'portIn',
            selectable: false,
            evented: true
        });
        portIn.on('mousedown', function() {
            console.log('Input port mouse down!');
        });
        portIn.on('mousedown', function() {
            canvas.discardActiveObject().renderAll();

            group.set({
                lockMovementX: true,
                lockMovementY: true
            });
        });
        portIn.on('mouseup', function() {
            console.log('Input port mouse up!');
        });
        portIn.on('mouseup', function() {
            group.set({
                lockMovementX: false,
                lockMovementY: false
            });
        });
        elements.push(portIn);
    }
    for (let n in output) {
        var portOut = new fabric.Rect({
            fill: '#f80',
            width: 1,
            height: 1,
            originX: 'center',
            originY: 'center',
            left: output[n][0] - width/2,
            top: output[n][1] - height/2,
            id: 'portOut'
        });
        portOut.on('mousedown', function() {
            console.log('Output port mouse down!');
        });
        portOut.on('mousedown', function() {
            canvas.discardActiveObject().renderAll();

            group.set({
                lockMovementX: true,
                lockMovementY: true
            });
        });
        portOut.on('mouseup', function() {
            console.log('Output port mouse up!');
        });
        portOut.on('mouseup', function() {
            group.set({
                lockMovementX: false,
                lockMovementY: false
            });
        });
        elements.push(portOut);
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

        name: name,
        id: 'gate'
    });

    group.setControlsVisibility(noVisibility);

    group.on('moving', function() {
        dummy.set({left: group.left, top: group.top});
    });

    group.on('mousedown', function(opt) {
        var selectingName = opt.target.get('name');
        document.getElementById('selecting').innerText = selectingName;
    });

    group.on('deselected', function(opt) {
        document.getElementById('selecting').innerText = 'None';
    });

    canvas.add(dummy);
    canvas.add(group);

    circuit.addNode(new Node(name, group));
    console.log(circuit);
    // console.log(group['_objects'][0])
}

canvas.renderAll();