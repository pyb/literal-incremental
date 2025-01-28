import { GameData } from "./GameData";

export interface GameState {
  //scores
  score: number,
  glyphs: number,
  words: number,
  maxWordSize: number,

  // typing / word construction
  lastPressed: string,
  inputBuffer: string,
  currentPartialWord: string,
  lastScoredWord: string,

  boughtKeys: Set<string>,
  repeatableKeys: Set<string>,
  repeatKeys: Set<string>,

  activeShopItems: Set<number>,
  visibleShopItems: Set<number>,

  inputVisible: boolean,
  unlockAvailable: boolean,
  repeatAvailable: boolean,
  //autoRepeat: useState<Set<([key: string]: number)>>();
  repeatSelectMode: boolean,

  log: Array<string>,
};

// Some of this stuff may be redundant/not belong here. eg visibleShopItems can be computed ? or nearly. not quite
// Consider using reducer as per https://react.dev/learn/extracting-state-logic-into-a-reducer
// dispatch messages might be increaseScore (glyph/word/maxWord, could be negative ie decrease);
//  makeVisible, makeActive ; toggleUIMode (select unlock, repeat, ...) ; log ; updateBuffer (input, partialword...)

export const initialGameState: GameState =
{
  score: 0,
  glyphs: 0,
  words: 0,
  maxWordSize: 0,

  lastPressed: "",
  inputBuffer: "",

  currentPartialWord: "",
  lastScoredWord: "",

  boughtKeys: new Set<string>(["i"]),
  repeatableKeys: new Set<string>(),
  repeatKeys: new Set<string>(),

  activeShopItems: new Set<number>(),
  visibleShopItems: new Set<number>(),

  inputVisible: false,
  unlockAvailable: false,
  repeatAvailable: false,
  repeatSelectMode: false,

  log: ["", "", "", "", GameData.welcomeMessage],
};

