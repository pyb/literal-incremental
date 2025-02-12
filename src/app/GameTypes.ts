export type Letter = {
    text: string,
    n: number, // >= 1
}

// Triggers on n times word or letter. 
export type Transform = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n: number,
    input: string, // word or letter
    output: string,
}

export const emptyTransform:Transform = {
    id:0, n:0, input:"", output:""
}

export type TransformLocation = {
    id: number,
    word: string, // combo word or letter
    // n: number, // not required
    location: number,
}

// Visible/invisible. Modifier?  Unlocked? Bound to available transform ? Bound to Unavailable transform?
// Currently in timeout?
 
// should these modes overlap? VISIBLE or INVISIBLE + UNLOCKED?
export enum KeyMode {
    Absent,
    Available,
    Letter,
    Visible,
    Unlocked,
    Modifier,
    LetterTranform,
    Tranform,
    Timeout,
    WordTransformKey,
}

export enum Modifier {
    None, // need this?
    Autorepeat,
    // ...
}

export enum ActionType {
    None, // need this?
    Transform,
    Input,
    ToggleModifier,
    Glyph, // increase glyphs score
    //...
}

export type Action = {
    type: Array<ActionType>,
    transformId?: number,
    letter?: string,
    modifier?: string,
    glyphs?: number,
}

export type KeyStatus = {
    key: string,
    modes: Set<KeyMode>,
    transformId?: number,
    modifier?: Modifier,
}