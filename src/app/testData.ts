import * as Types from "./GameTypes"
import * as TestUtil from "./testUtil"

const testInputS:string = "fobar(9)f(3)catoc(3)a(1)t(3)(3)o(3)in(13)nbazhousesqui(10)rebaba(3)zi(5)n";
export const testInput:Array<Types.Letter> = TestUtil.convertTestInput(testInputS);
export const testTransforms:Array<Types.Transform> = [
    {id:0, n: 10, input: "i", output:"n"},
    {id:1, n: 10, input: "n", output:"e"},
    {id:2, n: 1,  input: "win", output:"!"},
    {id:3, n: 1,  input: "in", output:""},
    {id:4, n: 1,  input: "foo", output:"bar"},
    {id:5, n: 1,  input: "baz", output:""},
    {id:6, n: 3,  input: "bar", output:"w"},
    {id:7, n:1,   input: "cat", output:""},
];
