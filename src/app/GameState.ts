import * as Types from "./GameTypes"

export type GameState = {
    glyphs: number,
    input: Array<Types.Letter>,
    unlockedKeys:Array<string>, // permanently
    availableKeys:Array<string>, // temporarily
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}

