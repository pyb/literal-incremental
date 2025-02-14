import { GameState } from "./gameState";
import * as Types from "./gameTypes"
import * as Test from "./testData"

const keyVisibility = {
    'i': 0,
    'n': 10,
    'e': 100,
    'w': 1000,
};

const startingVisibleKeys = ["i", "n", "Enter"];
const startingUnlockedKeys = ["i"];

export const initialGameState:GameState = {
    glyphs: 0,
    stream:Test.testInput,
    visibleKeys: startingVisibleKeys,
    unlockedKeys: startingUnlockedKeys,
    dict:Test.testTransforms,
    lastTransform: undefined,
};

const GameData = {
    keyVisibility: keyVisibility,
    initialGameState: initialGameState,
};

export default GameData;