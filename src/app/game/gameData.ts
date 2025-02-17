import { GameState } from "game/gameTypes";
import * as Types from "game/gameTypes";
import { EffectType , Effect } from "game/gameTypes";
import * as Test from "test/testData"
import UIData from "UI/uiData";

export const keyVisibility = new Map<string, number>([
    ['i', 0],
    ['n', 10],
    [UIData.wordTransformKey, 50],
    ['e', 100],
    ['w', 1000]]);

//const startingVisibleKeys = ["i", "n", "w", "e", UIData.wordTransformKey];
const startingVisibleKeys = new Set<string>();
keyVisibility.forEach((visibility:number, key:string) => { if (visibility == 0) startingVisibleKeys.add(key)});

const startingUnlockedKeys = ["i"];

const unlockEffect1:Effect = {
    type: EffectType.LetterUnlock,
    letter: "e",
}

export const dict: Array<Types.Transform> = [
    {
        visibility: 300,
        input: "win",
        output: "",
        shortDesc: "WIN",
        longDesc: "Win the Game."
    },
    {
        n: 10,
        visibility: 100,
        input: "i",
        output: "n",
    },
    {
        n: 10,
        visibility: 1000,
        input: "n",
        output: "e"
    },
    {
        visibility: 500,
        input: "in",
        output: "",
        shortDesc: "ULK_E",
        longDesc: "Unlock letter e",
        effect: unlockEffect1,
    },
    {
        visibility: 3000,
        input: "inn",
        output: "",
        shortDesc: "REPI",
        longDesc: "Unlock I repeater"
    },
    { // should there be something required to unlock this?
        visibility: 30,
        input: "i",
        output: "",
        shortDesc: "2LW",
        longDesc: "Unlock two-letter words",
    },
    
    { input: "foo", output: "bar", shortDesc: "LRU1", longDesc: "LongPress Repeat Upgrade 1"},
    { input: "baz", output: "", shortDesc: "Test2", longDesc: "Test2" },
 //   { n: 3, input: "bar", output: "w" },
    { input: "bar", output: "w" },
    { input: "cat", output: "", shortDesc: "Test3", longDesc: "Test3" },

].map((item, id) => ({ ...item, id: id }));

const welcomeMessage = "Welcome to Literal Incremental.";

const log = Array<Types.LogItem>();
for (let i = 0 ; i < UIData.logSize - 1 ; i++)
{
  log.push({text: "", key: i});
}
log.push({text: welcomeMessage, key: UIData.logSize - 1});

export const slowRepeat = 500;
export const fastRepeat = 50;

export const specialKeys = new Set<string>([UIData.wordTransformKey, UIData.repeatModeKey]);

export const initialGameState:GameState = {
    glyphs: 0,
    //stream:Test.testInput,
    stream: [],
    visibleKeys: startingVisibleKeys,
    unlockedKeys: startingUnlockedKeys,
    pressedKeys: new Set<string>([]),
    dict:dict,
    lastTransform: undefined,
    log: log,
    logKey: UIData.logSize,
    repeatDelay: slowRepeat,
    maxWordSize: 3,
};
