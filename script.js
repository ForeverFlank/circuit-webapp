const gatesDict =
{
    "AND": {
        "width": 60,
        "height": 40,
        "input": 2,
        "output": 1
    },
    "OR": {
        "width": 60,
        "height": 40,
        "input": 2,
        "output": 1
    }
}

// create buttons
for(let k in gatesDict) {
    let button = document.createElement('button');
    button.innerHTML = k;
    button.textContent = k;
    button.addEventListener("click", () => addGate(k));
    document.body.appendChild(button);
};

// graph section
class DirectedGraph {
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
circuit = new DirectedGraph();


// renderer section
var canvas = new fabric.Canvas('c');
canvas.perPixelTargetFind = true;

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

    var body = new fabric.Rect({
        fill: '#ddd',
        width: width,
        height: height,
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        id: 0
    });
    elements.push(body);

    var text = new fabric.Text(name, {
        fontFamily: 'Consolas',
        fontSize: 20,
        originX: 'center',
        originY: 'center',
        id: 0
    });
    elements.push(text);

    nodes = []
    for (var i = 0; i < input; i++) {
        var node = new fabric.Rect({
            fill: '#48f',
            width: 10,
            height: 10,
            originX: 'center',
            originY: 'center',
            left: -width/2,
            top: height * (i+1)/(input+1) - height/2,
            id: 1
        });
        node.on('mousedown', function() {
            console.log('Rectangle clicked!');
        });
        nodesArray.push(node);
    }

    for (var i = 0; i < output; i++) {
        nodesArray.push(new fabric.Rect({
            fill: '#f80',
            width: 10,
            height: 10,
            originX: 'center',
            originY: 'center',
            left: width/2,
            top: height * (i+1)/(output+1) - height/2,
            id: 1
        }));
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

    var group = new fabric.Group([body, nodes], {
        left: 100,
        top: 100,
        hasControls: false,
        lockMovementX: false,
        lockMovementY: false,
        subTargetCheck: true
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

    nodes.on('mousedown', function() {
        group.set({
            lockMovementX: true,
            lockMovementY: true
        });
    });
      
    nodes.on('mouseup', function() {
        group.set({
            lockMovementX: false,
            lockMovementY: false
        });
    });

    canvas.add(group);
}

canvas.renderAll();