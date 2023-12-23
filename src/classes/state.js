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
    static not(s) {
        if (s == State.err || s == State.highZ) return State.err;
        if (s == State.high) return State.low;
        return State.high;
    }
    static and(s) {
        for (let i in s)
            if (s[i] == State.low) return State.low;
        for (let i in s)
            if (s[i] == State.err || s[i] == State.highZ) return State.err;
        return State.high;
    }
    static or(s) {
        for (let i in s)
            if (s[i] == State.high) return State.high;
        for (let i in s)
            if (s[i] == State.err || s[i] == State.highZ) return State.err;
        return State.low;
    }
    static xor(a, b) {
        let p = State.and([a, State.not(b)]);
        let q = State.and([b, State.not(a)]);
        return State.or([p, q]);
    }
    static color(s) {
        if (s == State.err) return color(128, 0, 0);
        if (s == State.highZ) return color(128, 128, 128);
        if (s == State.low) return color(255, 0, 0);
        if (s == State.high) return color(0, 255, 0);
    }
}