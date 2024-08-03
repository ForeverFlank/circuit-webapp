import { EventHandler } from "./event-handler.js";

function addMoveEvents() {
    EventHandler.add("pointermove",
        function updateMousePosition(e) {
            EventHandler.previousMousePosition.x = EventHandler.mousePosition.x;
            EventHandler.previousMousePosition.y = EventHandler.mousePosition.y;

            EventHandler.mousePosition.x = e.clientX;
            EventHandler.mousePosition.y = e.clientY;

            EventHandler.deltaMousePosition.x = EventHandler.mousePosition.x - EventHandler.previousMousePosition.x;
            EventHandler.deltaMousePosition.y = EventHandler.mousePosition.y - EventHandler.previousMousePosition.y;
        }
    )
}

export { addMoveEvents }