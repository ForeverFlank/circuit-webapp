let buttons = {
    "gate-io": [
        ["Input", () => Input.add()],
        ["Output", () => Output.add()],
        ["N-bit Input", () => NBitInput.add()],
        ["LED", () => LED.add()],
    ],
    "gate-basic": [
        ["NOT", () => NotGate.add()],
        ["Tri-State Buffer", () => TriStateBuffer.add()],
        ["AND", () => AndGate.add()],
        ["NAND", () => NandGate.add()],
        ["OR", () => OrGate.add()],
        ["NOR", () => NorGate.add()],
        ["XOR", () => XorGate.add()],
        ["XNOR", () => XnorGate.add()],
    ],
    "gate-plexers": [
        ["1-to-2 Decoder", () => Decoder1To2.add()],
        ["2-to-4 Decoder", () => Decoder2To4.add()],
        ["3-to-8 Decoder", () => Decoder3To8.add()],
    ],
    "gate-latches": [
        ["SR Latch", () => SRLatch.add()],
        ["D Latch", () => DLatch.add()],
        ["D Flip Flop", () => DFlipFlop.add()],
        ["T Flip Flop", () => TFlipFlop.add()],
        ["JK Flip Flop", () => JKFlipFlop.add()],
        ["Register", () => Register.add()],
    ],
    "gate-arithmetic": [
        ["Half Adder", () => HalfAdder.add()],
        ["Full Adder", () => FullAdder.add()],
        ["N-bit Adder", () => NBitAdder.add()],
    ],
    "gate-nbit": [
        ["N-bit Input", () => NBitInput.add()],
        ["Splitter", () => openSplitterMenu()],
        ["Bitwise NOT", () => BitwiseNotGate.add()],
        ["N-bit Tri-State Buffer", () => NBitTriStateBuffer.add()],
        ["Bitwise AND", () => BitwiseAndGate.add()],
        ["Bitwise OR", () => BitwiseOrGate.add()],
        ["N-bit Multiplexer", () => NBitMultiplexer.add()],
        ["N-bit Adder", () => NBitAdder.add()],
    ],
};

for (let container in buttons) {
    let div = document.getElementById(container);
    buttons[container].forEach(([title, onClick]) => {
        const button = document.createElement("button");
        button.textContent = title;
        button.onclick = onClick;
        div.appendChild(button);
    });
}
