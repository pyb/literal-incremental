import { GameState } from "game/gameTypes";
import * as Types from "game/gameTypes";
import { EffectType , Effect } from "game/gameTypes";
import * as Test from "test/testData"
import UIData from "UI/uiData";

export const keyVisibility = new Map<string, number>([
    ['i', 0],
    ['n', 10],
    [UIData.wordTransformKey, 5],
    [UIData.repeatModeKey, 3],
    //['control', 3],
    ['e', 100],
    ['w', 100]]);
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

//const startingVisibleKeys = ["i", "n", "w", "e", UIData.wordTransformKey];
const startingVisibleKeys = new Set<string>();
keyVisibility.forEach((visibility:number, key:string) => { if (visibility == 0) startingVisibleKeys.add(key)});

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

export const dict: Array<Types.Transform> = [
    {
        id:0,
        visibility: 300,
        input: "win",
        output: "",
        shortDesc: "WIN",
        longDesc: "Win the Game."
    },
    {
        id:1,
        n: 10,
        visibility: 100,
        input: "i",
        output: "n",
    },
    {
        id:2,
        n: 10,
        visibility: 1000,
        input: "n",
        output: "e"
    },
    {
        id:3,
        visibility: 1000,
        input: "ne",
        output: "",
        shortDesc: "ULK_T1",
        longDesc: "Unlock Transform REPI",
        effect: unlockTransform1,
    },
    {
        id:4,
        visibility: 500,
        input: "in",
        output: "",
        shortDesc: "ULK_E",
        longDesc: "Unlock letter e",
        effect: unlockEffect1,
    },
    {
        id:5,
        visibility: 3000,
        input: "inn",
        output: "",
        shortDesc: "REPI",
        longDesc: "Unlock I repeater",
        effect: repeaterI,
    },
    { // should there be something required to unlock this?
        id:6,
        visibility: 30,
        input: "i",
        output: "",
        shortDesc: "2LW",
        longDesc: "Unlock two-letter words",
    },
    {
        id:7,
        visibility: 30,
        input: "ninini",
        output: "",
        shortDesc: "ULWIN",
        longDesc: "Unlock WIN",
        effect: unlockWin,
    },
    {
        id:8,
        input: "nininin",
        output: "",
        shortDesc: "REPI+",
        longDesc: "Improve repeat delay I",
        effect: repeatRateUpgradeI,
    },

    { id:100, input: "foo", output: "bar", shortDesc: "LRU1", longDesc: "LongPress Repeat Upgrade 1"},
    { id:101, input: "baz", output: "", shortDesc: "Test2", longDesc: "Test2" },
 //   { n: 1001, input: "bar", output: "w" },
    { id:102, input: "bar", output: "w" },
    { id:103, input: "cat", output: "", shortDesc: "Test3", longDesc: "Test3" },

];

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

export const initialGameState:GameState = {
    glyphs: 0,
    //stream:Test.testInput,
    stream: [],
    visibleKeys: startingVisibleKeys,
    unlockedKeys: startingUnlockedKeys,
    pressedKeys: new Set<string>(),
    repeatingKeys: new Set<string>(),
    activeKeys: new Set<string>(),
    repeatableKeys: new Set<string>(),
    keysToTrigger: new Set<string>(),
    currentPressedKeysTracker: new Map<string, number>(),
    dict:dict,
    lastTransform: undefined,
    unlockedTransforms: new Set<number>([1,2,3,4,7,8]),
    log: log,
    logKey: UIData.logSize,
    repeatDelayMultiplier: 1,
    repeatDelays: new Map<string, number>(),
    maxWordSize: 1,
    toggleRepeatMode: false,
};
