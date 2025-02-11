import * as Types from "./GameTypes"

export type GameState = {
    glyphs: number,
    stream: Array<Types.Letter>,
    dict: Array<Types.Transform>,
    unlockedKeys:Array<string>, // permanently
    availableKeys:Array<string>, // temporarily
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}

