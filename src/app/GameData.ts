import { GameState } from "./GameState";
import * as Types from "./GameTypes"
import * as Test from "./testData"

const keyVisibility = {
    'i': 0,
    'n': 10,
    'e': 100,
    'w': 1000,
};

const iStatus:Types.KeyStatus = {
    key: "i",
    modes: new Set<Types.KeyMode>([Types.KeyMode.Unlocked, Types.KeyMode.Letter]),
}

const nStatus:Types.KeyStatus = {
    key: "n",
    modes: new Set<Types.KeyMode>([Types.KeyMode.LetterTranform, Types.KeyMode.Available]),
}

const initialKeyStatus = new Map<string, Types.KeyStatus>([["i", iStatus],
                                                           ["n", nStatus]
]);

const initialGameState:GameState = {
    glyphs: 0,
    //input: [],
    stream:Test.testInput,
    keyStatus: initialKeyStatus,
 //   unlockedKeys:["i"],
 //   availableKeys:[],
    dict:Test.testTransforms,
};

const GameData = {
    keyVisibility: keyVisibility,
    initialGameState: initialGameState,
};

export default GameData;