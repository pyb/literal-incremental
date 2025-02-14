'use client'

// Low level keyboard handling
import uiData from "UI/uiData";

// Highlighting how?
let pressedKeys = new Set<string>();

let processKey: (key:string) => void;

export const setup = (processKeyFn: (key:string) => void) => {
    const tick = uiData.tick;
    processKey = processKeyFn;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export const teardown = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}

const handleKeyDown = (event:KeyboardEvent) => {
    const key:string = event.key;

    if (!event.repeat) // todo : handle repeat ourselves
    {
        if(!pressedKeys.has(key)) {
            processKey(key);
            pressedKeys.add(key);
        }
    } 
}

const handleKeyUp = (event:KeyboardEvent) => {
    const key:string = event.key;
    pressedKeys.delete(key);
}
