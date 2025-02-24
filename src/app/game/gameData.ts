import { GameState } from "game/gameTypes";
import * as Types from "game/gameTypes";
import { EffectType , Effect } from "game/gameTypes";
//import * as Test from "test/testData"
import UIData from "UI/uiData";

export const keyVisibility = new Map<string, number>([
    ['i', 0],
    ['n', 25],
    [UIData.wordTransformKey, 74],
    [UIData.repeatModeKey, 1000],
    ['o', 200],
    ['e', 500],
    ['w', 350]]);

export const gameKeys = new Set<string> ( [...keyVisibility.keys()]);

//const startingVisibleKeys = ["i", "n", "w", "e", tombStone, UIData.wordTransformKey];
const startingVisibleKeys = new Set<string>();
const startingUnlockedKeys = ["i"];
keyVisibility.forEach((visibility:number, key:string) => { if (visibility == 0) startingVisibleKeys.add(key)});

export const tombStone = "x"; // "Tombstone" letter, which will block parts of the stream from joining to form words

const unlockEffect1:Effect = {
    type: EffectType.LetterUnlock,
    letter: "e",
}

const unlockTransform1:Effect = {
    type:EffectType.TransformUnlock,
    transform: 5,
}

const unlockWin:Effect = {
    type:EffectType.TransformUnlock,
    transform: 0,
}

const repeatRateUpgradeI:Effect = {
    type:EffectType.UpgradeRepeater,
    letter: "i",
    level:2, // 2x
}

const repeaterI:Effect = {
    type:EffectType.LetterRepeaterUnlock,
    letter: "i",
}

const unlockTwoLetter:Effect = {
    type:EffectType.WordLengthUnlock,
    level:2,
}

const unlockThreeLetter:Effect = {
    type:EffectType.WordLengthUnlock,
    level:3,
}

const unlockCheapN:Effect = {
    type:EffectType.TransformUnlock,
    level:111,
}

//const initialUnlockedTransforms:Array<number> = [1,2,4,9];
const initialUnlockedTransforms:Array<number> = [1,2,4,5,9]; // added 5 for testing in vs inn upon enter

export const dict: Array<Types.Transform> = [
    {
        id:0,
        visibility: 400,
        word: "win",
        output: "",
        shortDesc: "WIN",
        longDesc: "Win the Game.",

    },
    {
        id:1,
        n: 40,
        visibility: 15,
        //shortDesc: "40I->N",
        letter: "i",
        output: "n",
    },
    {
        id:2,
        n: 10,
        visibility: 200,
        letter: "n",
        output: "o"
    },
/*
    // Need this?
    {
        id:3,
        visibility: 1000000,
        word: "ne",
        output: "",
        shortDesc: "ULK_T1",
        longDesc: "Unlock Transform REPI",
        effect: unlockTransform1,
    },
*/
    // should this be unlocked from the start?
    {
        id:4,
        visibility: 75,
        word: "in",
        shortDesc: "3LW",
        output: tombStone,
        longDesc: "Unlock three-letter words",
        effect: unlockThreeLetter,
        effectCharges: 1,
        transformKeyActivates: true, // and not just x
    },
    {
        id:5,
        visibility: 180,
        word: "inn",
        output: "e",
    },
    {
        id:9,
        visibility: 400,
        word: "ion",
        output: "x",
        shortDesc: "ULK_INN",
        longDesc: "Unlock Transform INN",
        effect: unlockTransform1,
        effectCharges: 1,
        transformKeyActivates: true,
    },
    {// what should unlock this? "UnlockCheapN"
        id: 111,
        n: 10,
        visibility: 1500,
        shortDesc: "I->N",
        letter: "i",
        output: "n",
    },
].sort((a, b) => a.visibility - b.visibility);

    /*
    {
        id:5,
        visibility: 3000,
        word: "inn",
        output: "",
        shortDesc: "REPI",
        longDesc: "Unlock I repeater",
        effect: repeaterI,
    },
    */
    /*
    { // should there be something required to unlock this? Also, it's not working
        id:6,
        visibility: 300,
        word: "i",
        output: "",
        shortDesc: "2LW",
        longDesc: "Unlock two-letter words",
        effect: unlockTwoLetter,
    },
    {
        id:54,
        visibility: 300000,
        word: "inlll",
        output: tombStone,
        shortDesc: "ULK_E",
        longDesc: "Unlock letter e",
        effect: unlockEffect1,
   
    },
    {
        id:16,
        visibility: 100000,
        word: "neg",
        output: "w",
    },
    {
        id:7,
        visibility: 100000,
        word: "ninini",
        output: "",
        shortDesc: "ULWIN",
        longDesc: "Unlock WIN",
        effect: unlockWin,
    },
    {
        id:8,
        word: "nininin",
        visibility: 100000,
        output: "",
        shortDesc: "REPI+",
        longDesc: "Improve repeat delay I",
        effect: repeatRateUpgradeI,
    },
    */
/*
    { id:100, visibility: 1000, word: "foo", output: "bar", shortDesc: "LRU1", longDesc: "LongPress Repeat Upgrade 1"},
*/

const welcomeMessage = "Welcome to Literal Incremental.";

const initialLog = Array<Types.LogItem>();
for (let i = 0 ; i < UIData.logSize - 1 ; i++)
{
    initialLog.push({text: "", key: i});
}
initialLog.push({text: welcomeMessage, key: UIData.logSize - 1});

export const fastRepeat = 10;
export const initialRepeatDelay = 500;

export const specialKeys = new Set<string>([UIData.wordTransformKey, UIData.repeatModeKey]);

export const initialGameState:GameState = {
    glyphs: 0,
    //stream:Test.testInput,
    stream: [],
    visibleKeys: startingVisibleKeys,
    unlockedKeys: new Set<string>(startingUnlockedKeys),
    pressedKeys: new Set<string>(),
    repeatingKeys: new Set<string>(),
    activeKeys: new Set<string>(),
    repeatableKeys: new Set<string>(),
    keysToTrigger: new Set<string>(),
    currentPressedKeysTracker: new Map<string, number>(),
    dict:dict,
    lastTransform: undefined,
    unlockedTransforms: new Set<number>(initialUnlockedTransforms),
    visibleTransforms: new Set<number>([]),
    log: initialLog,
    logKey: UIData.logSize,
    //repeatDelayMultiplier: fastRepeat,
    repeatDelayMultiplier: 1,
    repeatDelays: new Map<string, number>([["i", initialRepeatDelay], ["n", initialRepeatDelay]]),
    maxWordSize: 2,
    toggleRepeatMode: false,
    destroyed: undefined,
    destroyedLocation: 0,
    destroyedWordCounter: 0,
    effectCharges: new Map<number,number>(),
};
