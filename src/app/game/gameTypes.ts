export type Letter = {
    text: string,
    n: number, // >= 1
}

// Triggers on n times word or letter. 
export type Transform = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n?: number,
    input: string, // word or letter
    output: string,
    visibility?: number,
    effect?: Effect,
}

export type GameStateUpdate = ((gs:GameState) => void) | null;

export enum EffectType {
    WordLengthUnlock,
    LetterUnlock,
    LetterRepeaterUnlock,
    ToggleRepeater,
    UpgradeRepeater,
    TransformUnlock,
    // ...
}

export type Effect = {
    type: EffectType,
    id?: number,
    shortDesc?: string,
    level?: number,
    letter?: string,
    transform?: number, // id
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
    Active,
    Letter,
    Visible,
    Unlocked,
    Modifier,
    LetterTranform,
    WordTransform, // ie bar->w type of transform
    Transform,
    Timeout,
    WordTransformKey, // ie Enter
    RepeatModeKey, // ie Control
    RepeatToggleAvailable,
}

export type KeyStatus = {
    key: string,
    modes: Set<KeyMode>,
    transformId?: number,
}

export type LogItem = {
    key: number,
    text: string
}

export type GameState = {
    glyphs: number,
    stream: Array<Letter>,
    dict: Array<Transform>,
    lastTransform: Transform|undefined,
    unlockedTransforms: Set<number>,
    
    visibleKeys: Set<string>,
    unlockedKeys: Array<string>,
    pressedKeys: Set<string>,
    activeKeys: Set<string>,
    repeatingKeys: Set<string>,
    repeatableKeys: Set<string>,
    keysToTrigger: Set<string>,
    currentPressedKeysTracker: Map<string, number>, // map key to elapsed time since last press

    log: Array<LogItem>,
    logKey: number,

    repeatDelay: number, // later: per-key repeat delay
    maxWordSize: number,
    toggleRepeatMode: boolean,
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}
