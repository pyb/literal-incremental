import * as Types from "./GameTypes"

export type GameState = {
    glyphs: number,
    stream: Array<Types.Letter>,
    dict: Array<Types.Transform>,
    keyStatus: Map<string, Types.KeyStatus>,
    lastTransform: Types.Transform|undefined,
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}

