const gatesArray =
[
    {
        "name": "AND",
        "input": 2,
        "output": 1
    },
    {
        "name": "OR",
        "input": 2,
        "output": 1
    }
]

const gatesDict = {};

for (const item of gatesArray) {
  const { name, input, output } = item;
  gatesDict[name] = { input, output };
}

// create buttons
gatesArray.forEach(x => {
    let button = document.createElement('button');
    button.innerHTML = x['name'];
    button.textContent = x['name'];
    button.addEventListener("click", () => addGate(x['name']));
    document.body.appendChild(button);
});

// renderer section
var canvas = new fabric.Canvas('c');

function createGate(name, width, height, inputs, outputs) {
    elements = []

    elements.push(new fabric.Rect({
        fill: '#ddd',
        width: width,
        height: height,
        originX: 'center',
        originY: 'center'
    }));

    elements.push(new fabric.Text(name, {
        fontFamily: 'Consolas',
        fontSize: 20,
        originX: 'center',
        originY: 'center'
    }));

    for (var i = 0; i < inputs; i++) {
        var node = new fabric.Rect({
            fill: '#48f',
            width: 20,
            height: 20,
            originX: 'center',
            originY: 'center',
            left: -width/2,
            top: height * (i+1)/(inputs+1) - height/2
        });
        node.on('mouseover', function() {
            console.log('Rectangle clicked!');
        });
        elements.push(node);
    }

    for (var i = 0; i < outputs; i++) {
        elements.push(new fabric.Rect({
            fill: '#f80',
            width: 20,
            height: 20,
            originX: 'center',
            originY: 'center',
            left: width/2,
            top: height * (i+1)/(outputs+1) - height/2
        }));
    }

    return elements;
}

function addGate(name) {
    var newGate = createGate(
        name,
        80,
        50,
        gatesDict[name]['input'],
        gatesDict[name]['output']);

    var group = new fabric.Group(newGate, {
        left: 100,
        top: 100,
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
    canvas.add(group);
}

// var new_gate = createGate('GATE', 80, 50, 1, 1)

// canvas.add(group);

/*
var rect = new fabric.Rect({ width: 100, height: 50, fill: 'green' });
rect.on('mousedown', function() {
  console.log('selected a rectangle');
});

canvas.add(rect);
*/

canvas.on('mouse:down', function (options)
{
    pos = canvas.getPointer(options.e);
    console.log("POSITION"+pos);
        activeObj = canvas.getActiveObject();
        if (Math.abs(pos.x - activeObj.left) < 10 && Math.abs(pos.y - activeObj.top) < 30 && Math.abs(pos.y - activeObj.top) > 10) {
            console.log("connector selected");            
        }    
});

canvas.renderAll();