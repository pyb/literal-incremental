// Saving, Loading

import superjson from 'superjson';
import { GameState } from "game/gameState";
import { initialGameState } from "game/gameData";

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

export const save = (state: GameState):void => {
    const s:string = superjson.stringify(state);
    localStorage.setItem(LIKey, s); 
}
