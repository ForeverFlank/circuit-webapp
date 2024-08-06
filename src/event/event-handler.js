class EventHandler {
    static events = [
        'pointerdown',
        'pointermove',
        'pointerup',
        'wheel'
    ]
    static functions = {}
    static lateFunctions = {}
    static pointerPosition = { x: 0, y: 0 };
    static previousPointerPosition = { x: 0, y: 0 };
    static deltaPointerPosition = { x: 0, y: 0 };
    constructor() {

    }
    static getInstance() {
        if (!EventHandler.instance) {
            EventHandler.instance = new EventHandler();
        }
        return EventHandler.instance;
    }
    static add(event, func) {
        if (event in EventHandler.functions) {
            EventHandler.functions[event].push(func);
        } else {
            EventHandler.functions[event] = [func];
        }
    }
    static addLate(event, func) {
        if (event in EventHandler.lateFunctions) {
            EventHandler.lateFunctions[event].push(func);
        } else {
            EventHandler.lateFunctions[event] = [func];
        }
    }
}

function onEvent(event, e) {
    let functions = EventHandler.functions[event];
    let lateFunctions = EventHandler.lateFunctions[event];
    for (let i = 0, len = functions.length; i < len; ++i) {
        functions[i](e);
    }
    for (let i = 0, len = lateFunctions.length; i < len; ++i) {
        lateFunctions[i](e);
    }
}
for (let item of EventHandler.events) {
    EventHandler.functions[item] = [];
    EventHandler.lateFunctions[item] = [];
    window.addEventListener(item,
        (e) => onEvent(item, e));
}


// window.addEventListener("pointerup", onpointerUp);

// EventHandler.add("pointerdown", () => console.log(EventHandler.pointerPosition))
function updatePointerPosition(e) {
    EventHandler.pointerPosition.x = e.clientX;
    EventHandler.pointerPosition.y = e.clientY;

    if (EventHandler.previousPointerPosition.x == 0 &&
        EventHandler.previousPointerPosition.y == 0
    ) {
        // prevent referencing
        EventHandler.previousPointerPosition.x = EventHandler.pointerPosition.x;
        EventHandler.previousPointerPosition.y = EventHandler.pointerPosition.y;
    }

    EventHandler.deltaPointerPosition.x = EventHandler.pointerPosition.x - EventHandler.previousPointerPosition.x;
    EventHandler.deltaPointerPosition.y = EventHandler.pointerPosition.y - EventHandler.previousPointerPosition.y;

    EventHandler.previousPointerPosition.x = EventHandler.pointerPosition.x;
    EventHandler.previousPointerPosition.y = EventHandler.pointerPosition.y;
}

EventHandler.add("pointermove", updatePointerPosition)
EventHandler.add("touchmove", updatePointerPosition)

EventHandler.addLate("pointerup",
    function latePointerUp(e) {
        EventHandler.previousPointerPosition = { x: 0, y: 0 };
    }
)

export { EventHandler };
