export type Letter = {
    text: string,
    n: number, // >= 1
}

// not in use... the stream is also an Array<Letter> yet I don't want to call it a Word...
export type Word = Array<Letter>;

// Triggers on n times word or letter. 
export type Transform = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n?: number,
    letter?: string, // for letter transforms
    word?: string,
    output: string,
    visibility: number,
    effect?: Effect,
    effectCharges?: number
    transformKeyActivates?: boolean,
}

export type GameStateUpdate = ((gs:GameState) => void) | null;

export enum EffectType {
    WordLengthUnlock,
    LetterUnlock,
    LetterRepeaterUnlock,
    ToggleRepeater,
    UpgradeRepeater,
    TransformUnlock,
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
    id:0, n:0, output:"", visibility:0
}

export type TransformLocation = {
    id: number,
    word: string, // combo word or letter
    location: number,
    length?: number, //in letters
    prio: number,
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
    maxWordSize: number,
    effectCharges: Map<number,number>, // id -> how many times transform id's effect used
    repeatDelays: Map<string, number>, 

    stream: Array<Letter>,

    dict: Array<Transform>,
    unlockedTransforms: Set<number>,
    visibleTransforms: Set<number>,
   
    visibleKeys: Set<string>,
    unlockedKeys: Set<string>,
    pressedKeys: Set<string>,
    activeKeys: Set<string>,
    repeatingKeys: Set<string>,
    repeatableKeys: Set<string>,
    keysToTrigger: Set<string>,
    currentPressedKeysTracker: Map<string, number>, // map key to elapsed time since last press
    toggleRepeatMode: boolean,

    // Is all the below UI state?
    log: Array<LogItem>,
    logKey: number,
    lastTransform: Transform|undefined,
    repeatDelayMultiplier: number,
    destroyed: Word|undefined,
    destroyedLocation: number,
    destroyedWordCounter: number,
}

export type UIState = {
    highlightDuration: number,
    tick: number,
}
