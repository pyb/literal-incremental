import { GameState } from "./GameState";
import * as Types from "./GameTypes"
import * as TestUtil from "./testUtil"

export const keyVisibility = {
    'i': 0,
    'n': 10,
    'e': 100,
    'w': 1000,
};

const testInputS:string = "fobar(9)f(3)catoc(3)a(1)t(3)(3)o(3)in(13)nbazhousesqui(10)rebaba(3)zi(5)n";
const testInput:Array<Types.Letter> = TestUtil.convertTestInput(testInputS);

const initialInput:Array<Types.Letter> = [];

export const initialGameState:GameState = {
    glyphs: 0,
    //input: initialInput,
    input:testInput,
    unlockedKeys:["i"],
    availableKeys:[],

};

