// Saving, Loading

import superjson, { SuperJSON } from 'superjson';
import { GameState, initialGameState } from "./GameState";

const LIKey = "LISAVE";

export const load = ():GameState => {
    const s = localStorage.getItem(LIKey);
    if (!s)
        return initialGameState;
    else
    {
        const state:GameState = superjson.parse(s);
        return state;
    }
}

export const save = (state: GameState) => {
    const s:string = superjson.stringify(state);
    localStorage.setItem(LIKey, s); 
}
