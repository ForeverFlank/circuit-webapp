import * as Gates from "./gates/gates.js"

let buttons = {
    "gate-io": [
        ["Input", () => Gates.Input.add()],
        ["Output", () => Gates.Output.add()],
        // ["N-bit Input", () => Gates.NBit.NBitInput.add()],
        ["LED", () => Gates.IO.LED.add()],
    ],
    "gate-basic": [
        ["NOT", () => Gates.Basic.NotGate.add()],
        ["Tri-State Buffer", () => Gates.Basic.TriStateBuffer.add()],
        ["AND", () => Gates.Basic.AndGate.add()],
        ["NAND", () => Gates.Basic.NandGate.add()],
        ["OR", () => Gates.Basic.OrGate.add()],
        ["NOR", () => Gates.Basic.NorGate.add()],
        ["XOR", () => Gates.Basic.XorGate.add()],
        ["XNOR", () => Gates.Basic.XnorGate.add()],
    ],
    "gate-plexers": [
        ["1-to-2 Decoder", () => Gates.Decoder1To2.add()],
        ["2-to-4 Decoder", () => Gates.Decoder2To4.add()],
        ["3-to-8 Decoder", () => Gates.Decoder3To8.add()],
    ],
    "gate-latches": [
        ["SR Latch", () => Gates.SRLatch.add()],
        ["D Latch", () => Gates.DLatch.add()],
        ["D Flip Flop", () => Gates.DFlipFlop.add()],
        ["T Flip Flop", () => Gates.TFlipFlop.add()],
        ["JK Flip Flop", () => Gates.JKFlipFlop.add()],
        ["Register", () => Gates.Register.add()],
    ],
    "gate-arithmetic": [
        ["Half Adder", () => Gates.HalfAdder.add()],
        ["Full Adder", () => Gates.FullAdder.add()],
        ["N-bit Adder", () => Gates.NBitAdder.add()],
    ],
    "gate-nbit": [
        ["N-bit Input", () => Gates.NBitInput.add()],
        ["Splitter", () => openSplitterMenu()],
        ["Bitwise NOT", () => Gates.BitwiseNotGate.add()],
        ["N-bit Tri-State Buffer", () => Gates.NBitTriStateBuffer.add()],
        ["Bitwise AND", () => Gates.BitwiseAndGate.add()],
        ["Bitwise OR", () => Gates.BitwiseOrGate.add()],
        ["N-bit Multiplexer", () => Gates.NBitMultiplexer.add()],
        ["N-bit Adder", () => Gates.NBitAdder.add()],
    ],
};

export function createGateMenuButtons() {
    for (let container in buttons) {
        let div = document.getElementById(container);
        buttons[container].forEach(([title, onClick]) => {
            const button = document.createElement("button");
            button.textContent = title;
            button.onclick = onClick;
            div.appendChild(button);
        });
    }
}
