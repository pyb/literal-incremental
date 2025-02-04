import { GameData, UIData } from "./GameData";
import { InputItem, LogItem } from "./GameTypes";

export interface GameState {
  glyphs: number,
  maxWordSize: number,

  // typing / word construction
  lastPressed: string,
  currentInput: InputItem,
  inputHistory: Array<InputItem>,
  lastScoredWord: string,

  availableKeys: Set<string>, // ie unlocked keys
  repeatableKeys: Set<string>,
  repeatKeys: Set<string>,

  activeShopItems: Set<number>,
  visibleShopItems: Set<number>,

  inputVisible: boolean,

  // TODO : review this, probably unusable now
  repeatAvailable: boolean,
  //autoRepeat: useState<Set<([key: string]: number)>>();
  repeatSelectMode: boolean,

  log: Array<LogItem>,
  logKey: number
};

// Some of this stuff may be redundant/not belong here. eg visibleShopItems can be computed ? or nearly. not quite
// Consider using reducer as per https://react.dev/learn/extracting-state-logic-into-a-reducer
// dispatch messages might be increaseScore (glyph/word/maxWord, could be negative ie decrease);
//  makeVisible, makeActive ; toggleUIMode (select unlock, repeat, ...) ; log ; updateBuffer (input, partialword...)

const log = Array<LogItem>();
for (let i = 0 ; i < UIData.logSize - 1 ; i++)
{
  log.push({text: "", key: i});
}
log.push({text: GameData.welcomeMessage, key: UIData.logSize - 1});

export const emptyInputItem:InputItem = {letter: "", word: "", prefix: "", n: 1};//, key:0};

export const initialGameState: GameState =
{
  glyphs: 0, // internal Glyphs score only needed for visibility?
  maxWordSize: 0,

  lastPressed: "", // FIXME/review : is this game state or ui state?
  currentInput: emptyInputItem,
  inputHistory: [],

  lastScoredWord: "",

  availableKeys: new Set<string>(["i"]),
  repeatableKeys: new Set<string>(),
  repeatKeys: new Set<string>(),

  activeShopItems: new Set<number>(),
  visibleShopItems: new Set<number>(),

  inputVisible: false,
  unlockAvailable: false,
  repeatAvailable: false,
  repeatSelectMode: false,

  log: log,
  logKey: UIData.logSize
};

