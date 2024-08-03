class EventHandler {
    static functions = {
        'pointerdown': [],
        'pointerup': [],
        'pointermove': [],
        'wheel': [],
    }
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
}
function onEvent(event, e) {
    let arr = EventHandler.functions[event];
    for (let i = 0, len = arr.length; i < len; ++i) {
        arr[i](e);
    }
}

for (let item in EventHandler.functions) {
    window.addEventListener(item,
        (e) => onEvent(item, e));
}
let placeX, placeY
// window.addEventListener("pointerup", onpointerUp);

EventHandler.add("pointerdown", () => console.log(EventHandler.pointerPosition))

EventHandler.add("pointermove",
    function updatePointerPosition(e) {
        EventHandler.previousPointerPosition.x = EventHandler.pointerPosition.x;
        EventHandler.previousPointerPosition.y = EventHandler.pointerPosition.y;

        EventHandler.pointerPosition.x = e.clientX;
        EventHandler.pointerPosition.y = e.clientY;

        EventHandler.deltaPointerPosition.x = EventHandler.pointerPosition.x - EventHandler.previousPointerPosition.x;
        EventHandler.deltaPointerPosition.y = EventHandler.pointerPosition.y - EventHandler.previousPointerPosition.y;
    }
)

export { EventHandler, placeX, placeY };
