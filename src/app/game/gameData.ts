import { GameState } from "game/gameTypes";
import * as Types from "game/gameTypes";
import { EffectType , Effect } from "game/gameTypes";
//import * as Test from "test/testData"
import UIData from "UI/uiData";
import {allAnagrams} from "game/util"

export const keyVisibility = new Map<string, number>([
    ['i', 0],
//    ['x', 1], //testing
    ['n', 10],
    // This should become visible slightly before the first word transform does ("in"?)
    [UIData.wordTransformKey, 250],
    //[UIData.wordTransformKey, 10],
    [UIData.repeatModeKey, 400],
    ['e', 600],
    ['w', 500]]);
/*
export const keyVisibility = new Map<string, number>([
    ['i', 0],
    ['n', 0],
    [UIData.wordTransformKey, 0],
    [UIData.repeatModeKey, 0],
    ['e', 0],
    ['w', 0]]);
*/

export const gameKeys = new Set<string> ( [...keyVisibility.keys()]);

//const startingVisibleKeys = ["i", "n", "w", "e", tombStone, UIData.wordTransformKey];
const startingVisibleKeys = new Set<string>();
keyVisibility.forEach((visibility:number, key:string) => { if (visibility == 0) startingVisibleKeys.add(key)});

export const tombStone = "x"; // "Tombstone" letter, which will block parts of the stream from joining to form words

//const startingUnlockedKeys = ["i", tombStone];
const startingUnlockedKeys = ["i"];

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

export const dict: Array<Types.Transform> = [
    {
        id:0,
        visibility: 400,
        word: "win",
        output: "",
        shortDesc: "WIN",
        longDesc: "Win the Game."
    },
    {
        id:1,
        n: 40,
        visibility: 20,
        shortDesc: "I->N",
        letter: "i",
        output: "n",
    },
    {
        id:2,
        n: 10,
        visibility: 1000,
        letter: "n",
        output: "e"
    },
    {
        id:3,
        visibility: 1000,
        word: "ne",
        output: "",
        shortDesc: "ULK_T1",
        longDesc: "Unlock Transform REPI",
        effect: unlockTransform1,
    },
    // should this be unlocked from the start?
    {
        id:4,
        visibility: 300,
        word: "in",
        output: tombStone,
        shortDesc: "ULK_E",
        longDesc: "Unlock letter e",
        effect: unlockEffect1,
    },
    {
        id:54,
        visibility: 3000,
        word: "inlll",
        output: tombStone,
        shortDesc: "3LW",
        longDesc: "Unlock three-letter words",
        effect: unlockThreeLetter,
    },
    {
        id:5,
        visibility: 3000,
        //visibility: 30,
        word: "inn",
        //output: "f",
        output: "",
        shortDesc: "REPI",
        longDesc: "Unlock I repeater",
        effect: repeaterI,
    },
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
        id:16,
        visibility: 1000,
        word: "neg",
        output: "w",
    },
    {
        id:7,
        visibility: 1000,
        word: "ninini",
        output: "",
        shortDesc: "ULWIN",
        longDesc: "Unlock WIN",
        effect: unlockWin,
    },
    {
        id:8,
        word: "nininin",
        visibility: 1000,
        output: "",
        shortDesc: "REPI+",
        longDesc: "Improve repeat delay I",
        effect: repeatRateUpgradeI,
    },

    { id:100, visibility: 1000, word: "foo", output: "bar", shortDesc: "LRU1", longDesc: "LongPress Repeat Upgrade 1"},
    { id:101, visibility: 1000, word: "baz", output: "", shortDesc: "Test2", longDesc: "Test2" },
 //   { id: 1001, visibility: 1000, n:3, input: "bar", output: "w" },
    { id:102, visibility: 1000, word: "bar", output: "w" },
    { id:103, visibility: 1000, word: "cat", output: "", shortDesc: "Test3", longDesc: "Test3" },

];

dict.forEach((transform:Types.Transform) => {
    const word = transform.word;
    if (word)
        transform.words = allAnagrams(word);
});

const welcomeMessage = "Welcome to Literal Incremental.";

const log = Array<Types.LogItem>();
for (let i = 0 ; i < UIData.logSize - 1 ; i++)
{
  log.push({text: "", key: i});
}
log.push({text: welcomeMessage, key: UIData.logSize - 1});

export const fastRepeat = 10;

export const initialRepeatDelay = 500;

export const specialKeys = new Set<string>([UIData.wordTransformKey, UIData.repeatModeKey]);

//const initialUnlockedTransforms:Array<number> = [1];
const initialUnlockedTransforms:Array<number> = [1,4,5];

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
    log: log,
    logKey: UIData.logSize,
    //repeatDelayMultiplier: fastRepeat,
    repeatDelayMultiplier: 1,
    repeatDelays: new Map<string, number>([["i", initialRepeatDelay], ["n", initialRepeatDelay]]),
    maxWordSize: 3,
    toggleRepeatMode: false,
    destroyed: undefined,
    destroyedLocation: 0,
    destroyedWordCounter: 0,
};
