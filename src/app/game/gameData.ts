import { GameState } from "game/gameState";
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