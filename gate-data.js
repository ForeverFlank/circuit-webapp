const state = {
    highZ: -1,
    low: 0,
    high: 1,
    evaluate: {
        and: (s) => {
            if (s[0] == 1 && s[1] == 1) return state.high;
            return state.low;
        },
        or: (s) => {
            if (s[0] == 1 || s[1] == 1) return state.high;
            return state.low;
        }
    }
};

var gates = {
    "in": {
        "displayName": "In",
        "width": 1,
        "height": 2,
        "inputs": [
        ],
        "outputs": [
            ['Output', [1, 1]]
        ]
    },
    "out": {
        "displayName": "Out",
        "width": 1,
        "height": 2,
        "inputs": [
            ['Input', [1, 1]]
        ],
        "outputs": [
        ]
    },
    "and": {
        "displayName": "AND",
        "width": 2,
        "height": 2,
        "inputs": [
            ['Input 1', [0, 0]],
            ['Input 2', [0, 2]]
        ],
        "outputs": [
            ['Output', [2, 1], state.evaluate.and]
        ]
    },
    "or": {
        "displayName": "OR",
        "width": 2,
        "height": 2,
        "inputs": [
            ['Input 1', [0, 0]],
            ['Input 2', [0, 2]]
        ],
        "outputs": [
            ['Output', [2, 1], state.evaluate.or]
        ]
    },
    "full adder": {
        "displayName": "Full\nAdder",
        "width": 2,
        "height": 2,
        "inputs": [
            ['A', [0, 0]],
            ['B', [0, 1]],
            ['Carry in', [0, 2]]
        ],
        "outputs": [
            ['Sum', [2, 0]],
            ['Carry out', [2, 1]]
        ]
    }
}
