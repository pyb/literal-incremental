import {DictItem} from "./GameTypes"
import * as fake from "./fakeState"
import {Trie} from "./trie/trie";

export type KeyInfo = {
  key: string,
  visibilityThreshold: number,
}

// Obsolete? Do keys still have a repeaterPrice?
const keyInfo:Array<KeyInfo> = [
  { key: 'i', visibilityThreshold: 0 },
  { key: 'n', visibilityThreshold: 100 },
  { key: 'w', visibilityThreshold: 1000},
  { key: 'e', visibilityThreshold: 3000 },
];

const dict: Array<DictItem> = [
  {
    n: 10,
    visibility: 100,
    word: "I",
    output: "N"
  },
  {
    n: 10,
    visibility: 1000,
    letter: "N",
    output: "E"
  },
  {
    visibility: 300,
    word: "WIN",
    shortDesc: "WIN",
    longDesc: "Win the Game."
  },
  {
    visibility: 500,
    word: "IN",
    shortDesc: "3LW",
    longDesc: "Unlock three-letter words."
  },
  {
    visibility: 3000,
    word: "INN",
    shortDesc: "REPI",
    longDesc: "Unlock I repeater"
  },
  { // should there be something required to unlock this?
    visibility: 30,
    word: "I",
    shortDesc: "2LW",
    longDesc: "Unlock two-letter words"
  },

  fake.item1,
  fake.item3,
  fake.item2,
];

export const UIData = 
{
  /* UI, internals stuff */
  tick: 1000, // setinterval delay
  highlightDuration: 150,
  logSize: 5,
  maxKeyboardRowSize: 6,
  dictLongForm: 3,
  dictRows: 3,
  dictColumns: 3,
  letterRepeatThreshold: 5,
};

export const GameData =
{
  welcomeMessage: "Welcome to Literal Incremental.",

  //maxWordLength: 4,
  inputSize: 20,
  autorepeatDelay: 500,

  /* Word / letter data */
  tdict: new Trie(),
  keyInfo: keyInfo,
  dict: dict,
  //keyScores: keyScores,
};

export const updateTDict = () => {
  GameData.tdict = Trie.fromArray(GameData.dict.filter((d) => d.word)
                                               .map((d) => d.word || ''));
}