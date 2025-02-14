import { GameState } from "game/gameTypes";
import * as Types from "game/gameTypes"
import * as Test from "test/testData"

const keyVisibility = {
    'i': 0,
    'n': 10,
    'e': 100,
    'w': 1000,
};

const startingVisibleKeys = ["i", "n", "Enter"];
const startingUnlockedKeys = ["i"];

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
        shortDesc: "3LW",
        longDesc: "Unlock three-letter words."
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
        longDesc: "Unlock two-letter words"
    },
    
    { n: 1, input: "foo", output: "bar" },
    { n: 1, input: "baz", output: "" },
    { n: 3, input: "bar", output: "w" },
    { n: 1, input: "cat", output: "" },

].map((item, id) => ({ ...item, id: id }));

export const initialGameState:GameState = {
    glyphs: 0,
    stream:Test.testInput,
    visibleKeys: startingVisibleKeys,
    unlockedKeys: startingUnlockedKeys,
    pressedKeys: new Set<string>([]),
    dict:dict,
    lastTransform: undefined,
};

const GameData = {
    keyVisibility: keyVisibility,
    initialGameState: initialGameState,
};

export default GameData;