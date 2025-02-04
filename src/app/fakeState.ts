import { InputItem, DictItem } from "./GameTypes";
import { KeyMode } from "./Keyboard";

export const item1: DictItem = {
    word: "foo",
    shortDesc: "BAR1",
    longDesc: "frobinates your thingmebobs by +1",
};

export const item2: DictItem = {
    n: 2,
    word: "X",
    output: "blabla",
};

export const item3: DictItem = {
    word: "barqux",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};

export const item4: DictItem = {
    word: "barqux4",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};
export const item5: DictItem = {
    word: "barqux5",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};
export const item6: DictItem = {
    n: 10,
    word: "I",
    output: "E",
};

export const item7: DictItem = {
    word: "barqux7",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};
export const item8: DictItem = {
    word: "barqu8",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};
export const item9: DictItem = {
    word: "barqux9",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};
export const item10: DictItem = {
    word: "barqux10",
    shortDesc: "REP",
    longDesc: "Make repeat rate three times faster",
};

export const shortItems: Array<DictItem> = [
    item1, item2, item3,
    item4, item5, item6,
    item7, item8, item9,
    item10
];

export const longItems: Array<DictItem> = [
    item1, item2
];

/*
export const testPrevInput: Array<InputItem> = [
    { letter: "i", word: "", score: 10, key: 0 },
    { letter: "n", word: "", score: 10, key: 1 },
    { letter: "", word: "baz", score: 10, key: 2 },
    { letter: "", word: "qux", score: 10, key: 3 },
    { letter: "t", word: "", score: 10, key: 4 },
];

export const testCurrentInput: InputItem = {
    letter: "",
    word: "fol",
    key: 100
};
*/

export const keyStati = [
    { key: "a", mode: KeyMode.VISIBLE },
    { key: "b", mode: KeyMode.BOUGHT },
    { key: "c", mode: KeyMode.BOUGHT },
    { key: "d", mode: KeyMode.PURCHASEABLE },
];

export const functionKeyStati = [
    { key: "tab", mode: KeyMode.FUNCTION_TOGGLED },
    { key: "rpt", mode: KeyMode.FUNCTION_VISIBLE },
];

export const fakeFocusedKey = "b";

export const fakePressedKeys = new Set(["b"]);