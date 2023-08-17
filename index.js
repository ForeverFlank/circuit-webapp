for(let k in gatesDict) {
    let button = document.createElement('button');
    button.innerHTML = k;
    button.textContent = k;
    button.addEventListener("click", () => addGate(k));
    document.body.appendChild(button);
};

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

ctx.scale(40, 40)

var bw = 400;
var bh = 400;

function drawBoard(){
    for (var x = 0; x <= bw; x += 1) {
        ctx.moveTo(0.5 + x, 0);
        ctx.lineTo(0.5 + x, bh);
    }

    for (var x = 0; x <= bh; x += 1) {
        ctx.moveTo(0, 0.5 + x);
        ctx.lineTo(bw, 0.5 + x);
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.01;
    ctx.stroke();
}

drawBoard();

ctx.fillStyle = '#ddd';
ctx.fillRect(2, 2, 1, 1);