'use client'

// Low level keyboard handling
import UIData from "UI/uiData";
import { GameState, GameStateUpdate } from "./gameTypes";
import { gameKeys } from "game/gameData";

/*
Key repeating, longpress/toggled.
Difficulty : for highlighting purporses, Keyboard component need time-separated keypress and non-keypress (by at least 1 tick)

Should be *no difference* between physically pressed, and autorepeat ! Same codepaths.
Why did I struggle? The "trigger" maybe, after switching on autorepeat

In Keyboard, it's clear. keys highlight from time to time if they are Active. That's it!
Onus on the game code to make key active only intermittently.

* New design :
Every tick
- Deactivate keys
- Removed all unpressed / not repeating keys from tracker Map (currentPressedKeysTracker)
- for all keys in tracker, increase elapsed by delta T. If elapsed > rep delay, execute + activate
- For all currently pressed/autorepeated keys not in tracked, execute, activate, and add them to the tracker (with 0 elapsed time)

changeKeypressStatus: when a key is pressed/released, add/remove it to pressedKeys Set.
*/



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