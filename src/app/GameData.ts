import { GameState } from "./GameState";
import * as Types from "./GameTypes"
import * as Test from "./testData"

export const keyVisibility = {
    'i': 0,
    'n': 10,
    'e': 100,
    'w': 1000,
};

export const initialGameState:GameState = {
    glyphs: 0,
    //input: [],
    stream:Test.testInput,
    unlockedKeys:["i"],
    availableKeys:[],
    dict:Test.testTransforms,
};
