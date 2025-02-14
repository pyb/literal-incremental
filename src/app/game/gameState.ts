import * as Types from "game/gameTypes"

export type GameState = {
    glyphs: number,
    stream: Array<Types.Letter>,
    dict: Array<Types.Transform>,
    lastTransform: Types.Transform|undefined,
    visibleKeys: Array<string>,
    unlockedKeys: Array<string>,
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}

