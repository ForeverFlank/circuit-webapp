class State {
    static err = -2;
    static highZ = -1;
    static low = 0;
    static high = 1;
    static fromNumber(num) {
        if (num == -2) return State.err;
        if (num == -1) return State.highZ;
        if (num == 0) return State.low;
        if (num == 1) return State.high;
    }
    static fromChar(char) {
        let state;
        if (char == "0") {
            state = State.low;
        } else if (char == "1") {
            state = State.high;
        } else if (char == "Z") {
            state = State.highZ;
        } else {
            state = State.err;
        }
        return state;
    }
    static not(b) {
        if (b == State.err || b == State.highZ) return State.err;
        if (b == State.high) return State.low;
        return State.high;
    }
    static and(b) {
        for (let i in b) if (b[i] == State.low) return State.low;
        for (let i in b)
            if (b[i] == State.err || b[i] == State.highZ) return State.err;
        return State.high;
    }
    static or(b) {
        for (let i in b) if (b[i] == State.high) return State.high;
        for (let i in b)
            if (b[i] == State.err || b[i] == State.highZ) return State.err;
        return State.low;
    }
    static xor(a, b) {
        let p = State.and([a, State.not(b)]);
        let q = State.and([b, State.not(a)]);
        return State.or([p, q]);
    }
    static color(b) {
        if (b == State.err) return 0x990000;
        if (b == State.highZ) return 0xa0a0a0;
        if (b == State.low) return 0xed2525;
        if (b == State.high) return 0x4ff02d;
        return 0x0000ff;
    }
    static char(b) {
        let char;
        if (b == State.low) {
            char = "0";
        } else if (b == State.high) {
            char = "1";
        } else if (b == State.highZ) {
            char = "Z";
        } else {
            char = "X";
        }
        return char;
    }
    static fromString(string) {
        string = string.toUpperCase();
        if (string.length < 1) return [State.err];
        let result = [];
        for (let i in string) {
            let char = string[string.length - i - 1];
            result[i] = State.fromChar(char);
        }
        return result;
    }
    static changeWidth(input, width, fill = State.highZ) {
        width = parseInt(width);
        if (input.length == width) return input;
        if (input.length > width) return input.slice(0, width);
        return input.concat(Array(width - input.length).fill(fill));
    }
    static toString(array) {
        return array
            .slice()
            .map((x) => State.char(x))
            .reverse()
            .join("");
    }
}

export { State }