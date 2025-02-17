'use client'

// Low level keyboard handling
import UIData from "UI/uiData";
import { GameState, GameStateUpdate } from "./gameTypes";
import { gameKeys } from "game/gameData";

// Highlighting how?
let pressedKeys = new Set<string>();

let processKey: (key:string, release:boolean) => void;

export const setup = (processKeyFn: (key:string, pressed:boolean) => void) => {
    const tick = UIData.tick;
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
            processKey(key, true);
            pressedKeys.add(key);
        }
    } 
}

const handleKeyUp = (event:KeyboardEvent) => {
    const key:string = event.key;
    pressedKeys.delete(key);
    processKey(key, false);
}

export const changeKeyPressStatus = (key: string, pressed: boolean):GameStateUpdate => {
    return (gs:GameState) => {
        if (pressed && gameKeys.has(key))
            gs.pressedKeys.add(key);
        else
            gs.pressedKeys.delete(key);
    }
}

// Note: This is prob. not just going to be a keyboard handling callback

let lastUpdate = Date.now(); // in ms

export const handleTick = ():GameStateUpdate => {
    const now = Date.now();
    const delta = now - lastUpdate;
    lastUpdate = now;

    return (gs:GameState) => {
        gs.activeKeys.clear();
        
        const pressedOrRepeatingKeys = new Set<string> ([...gs.pressedKeys, ...gs.repeatingKeys]);
        const otherKeys = new Set<string>([...gs.currentPressedKeysTracker.keys()]).difference(pressedOrRepeatingKeys);
        otherKeys.forEach((key:string) => gs.currentPressedKeysTracker.delete(key));
        
        gs.currentPressedKeysTracker.forEach((elapsed: number, key: string) => {
            if ((elapsed + delta) >= gs.repeatDelay)
            {
                gs.currentPressedKeysTracker.set(key, 0);
                gs.keysToTrigger.add(key);
            }
            else {
                gs.currentPressedKeysTracker.set(key, elapsed+delta);
            }
            pressedOrRepeatingKeys.delete(key);
        });
        pressedOrRepeatingKeys.forEach((key: string) => {
            gs.currentPressedKeysTracker.set(key, 0);
            gs.keysToTrigger.add(key);
        })
    }
}