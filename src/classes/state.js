class Bit {
    static err = -2;
    static highZ = -1;
    static low = 0;
    static high = 1;
    static fromNumber(num) {
        if (num == -2) return Bit.err;
        if (num == -1) return Bit.highZ;
        if (num == 0) return Bit.low;
        if (num == 1) return Bit.high;
    }
    static fromChar(char) {
        let state;
        if (char == '0') {
            state = Bit.low;
        } else if (char == '1') {
            state = Bit.high;
        } else if (char == 'Z') {
            state = Bit.highZ;
        } else {
            state = Bit.err;
        }
        return s;
    }
    static not(b) {
        if (b == Bit.err || b == Bit.highZ) return Bit.err;
        if (b == Bit.high) return Bit.low;
        return Bit.high;
    }
    static and(b) {
        for (let i in b)
            if (b[i] == Bit.low) return Bit.low;
        for (let i in b)
            if (b[i] == Bit.err || b[i] == Bit.highZ) return Bit.err;
        return Bit.high;
    }
    static or(b) {
        for (let i in b)
            if (b[i] == Bit.high) return Bit.high;
        for (let i in b)
            if (b[i] == Bit.err || b[i] == Bit.highZ) return Bit.err;
        return Bit.low;
    }
    static xor(a, b) {
        let p = Bit.and([a, Bit.not(b)]);
        let q = Bit.and([b, Bit.not(a)]);
        return Bit.or([p, q]);
    }
    static color(b) {
        if (b == Bit.err) return color('#990000');
        if (b == Bit.highZ) return color('#a0a0a0');
        if (b == Bit.low) return color('#ed2525');
        if (b == Bit.high) return color('#4fe52d');
    }
    static char(b) {
        let char;
        if (b == Bit.low) {
            char = '0';
        } else if (b == Bit.high) {
            char = '1';
        } else if (b == Bit.highZ) {
            char = 'Z';
        } else {
            char = 'X';
        }
        return char;
    }
}

class State {
    constructor(width = 1) {
        this.width = width;
        this.value = {};
    }
    slice(start, end) {
        let result = new State();
        for (let i = start; i <= end; i++) {
            result.value[i] = this.value[i];
        }
        return result;
    }
    pad(width, value = State.highZ) {
        if (width <= this.width) return this;
        let result = new State();
        for (let i = 0; i < this.width; i++) {
            result.value[i] = this.value[i];
        }
        for (let i = this.width; i < width; i++) {
            result.value[i] = value;
        }
        return result;
    }
    bit(index) {
        return result.value[index];
    }
    static fromString(value, width = value.length) {
        this.value = {};
        for (let i = 0; i < width; i++) {
            this.value[i] = Bit.fromChar(value.value[i]);
        }
    }
    static not(s) {
        let result = new State();
        for (let i = 0; i < s.width; i++) {
            result.value[i] = not(s.value[i]);
        }
        return result;
    }
    static and(a, b) {
        let result = new State();
        for (let i = 0; i < s.width; i++) {
            result.value[i] = and(a.value[i], b.value[i]);
        }
        return result;
    }
    toString() {
        
    }
}