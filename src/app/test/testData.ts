import * as Types from "game/gameTypes"
import * as TestUtil from "test/testUtil"

const testInputS: string = "fobar(9)f(3)catoc(3)a(1)t(3)j(3)o(3)in(13)bazhousesqui(12)rebaba(3)zi(5)n";
export const testInput: Array<Types.Letter> = TestUtil.convertTestInput(testInputS);
export const testTransforms: Array<Types.Transform> = [
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

export const testAvailableKeys = ["n", "Enter"];
