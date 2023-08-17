/*
const gatesDict =
{
    "AND": {
        "width": 3,
        "height": 2,
        "input": 2,
        "output": 1
    },
    "OR": {
        "width": 6,
        "height": 4,
        "input": 2,
        "output": 1
    }
}
*/

// create buttons
for(let k in gatesDict) {
    let button = document.createElement('button');
    button.innerHTML = k;
    button.textContent = k;
    button.addEventListener('click', () => addGate(k));
    document.getElementById('gates').appendChild(button);
};

// graph section
// thank you ChatGPT
class Graph {
    constructor() {
      this.vertices = {};
    }
  
    addVertex(vertex) {
      this.vertices[vertex] = [];
    }
  
    addEdge(fromVertex, toVertex) {
        if (!this.vertices[fromVertex] || !this.vertices[toVertex]) {
            throw new Error('One or both vertices do not exist in the graph.');
        }
    
        this.vertices[fromVertex].push(toVertex);
    }
  
    getOutgoingEdges(vertex) {
        if (!this.vertices[vertex]) {
            throw new Error('Vertex does not exist in the graph.');
        }
    
        return this.vertices[vertex];
    }
}
circuit = new Graph();

// renderer section
var canvas = new fabric.Canvas('c');
canvas.perPixelTargetFind = true;
canvas.preserveObjectStacking = true;

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

    
    var body = new fabric.Group(elements, {
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        lockMovementX: false,
        lockMovementY: false
    })

    /*
    var nodes = new fabric.Group(nodesArray, {
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        subTargetCheck: true
    })
    */
/*
    var group = new fabric.Group([body, nodes], {
    // var group = new fabric.Group(elements, {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        hasControls: false,
        lockMovementX: false,
        lockMovementY: false,
        subTargetCheck: true
    });
*/

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

    /*
    nodes.on('mousedown', function() {
        group.set({
            lockMovementX: true,
            lockMovementY: true
        });
        // dummy.left = group.left;
    });
      
    nodes.on('mouseup', function() {
        group.set({
            lockMovementX: false,
            lockMovementY: false
        });
    });
    */

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