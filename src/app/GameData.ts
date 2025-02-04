export type KeyInfo = {
  key: string,
  visibilityPrice: number,
  repeaterPrice: number,
  score?: number // no longer needed?
}

export enum ShopAction {
  LETTERUNLOCK,
  WORDUNLOCK,
  REPEATUNLOCK
}

export type ShopEntry = {
  index: number,
  text: string,
  action: ShopAction,
  n: number,
  position: number,
  visibilityPrice: number,
  price: number
}

// Obsolete? Do keys still have a repeaterPrice?
const keyInfo:Array<KeyInfo> = [
  { key: 'i', visibilityPrice: 0, repeaterPrice: 50, score: 1},
  { key: 's', visibilityPrice: 10, repeaterPrice: 5000},
  { key: 'x', visibilityPrice: 50, repeaterPrice: 50000 },
  { key: 'n', visibilityPrice: 100, repeaterPrice: 5000 },
];

/*
const keyScores: Record<string, number>= {};
*/

const shopEntries:Array<ShopEntry> = ([
  {text: "Unlock a Letter", action: ShopAction.LETTERUNLOCK, n: 1, position: 0, visibilityPrice: 10, price: 40},
  {text: "Unlock another Letter", action: ShopAction.LETTERUNLOCK, n: 2, position: 10, visibilityPrice: 60, price: 150},
  {text: "Unlock Word formation", action: ShopAction.WORDUNLOCK, n: 1, position: 20, visibilityPrice: 40, price: 100},
  {text: "Unlock 2-letter Words", action: ShopAction.WORDUNLOCK, n: 2, position: 130, visibilityPrice: 200, price: 220},
  {text: "Unlock 3-letter Words", action: ShopAction.WORDUNLOCK, n: 3, position: 140, visibilityPrice: 200, price: 2000},
  {text: "Unlock 4-letter Words", action: ShopAction.WORDUNLOCK, n: 4, position: 150, visibilityPrice: 2000, price: 6000},
  {text: "Unlock a third Letter", action: ShopAction.LETTERUNLOCK, n: 3, position: 200, visibilityPrice: 5000, price: 40000},
  {text: "Unlock a Repeater", action: ShopAction.REPEATUNLOCK, n: 1, position: 300, visibilityPrice: 40, price: 80},
].map((entry: any, index: number) => { entry.index = index; return entry; })); // add an index property starting at 0

export const UIData = 
{
  /* UI, internals stuff */
  tick: 50, // setinterval delay
  highlightDuration: 150,
  logSize: 5,
  maxKeyboardRowSize: 6,
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
  tinydict: ['i', 'sin', 'is', 'in', 'si', 'six', 'nix'],
  keyInfo: keyInfo,
  //keyScores: keyScores,
  shopEntries: shopEntries,
};
