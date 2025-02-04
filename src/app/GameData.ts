export type KeyInfo = {
  key: string,
  visibilityPrice: number,
  repeaterPrice: number,
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
  { key: 'i', visibilityPrice: 0, repeaterPrice: 100},
  { key: 'n', visibilityPrice: 100, repeaterPrice: 5000 },
  { key: 'w', visibilityPrice: 1000, repeaterPrice: 5000 },
];

/*
const keyScores: Record<string, number>= {};
*/

export const UIData = 
{
  /* UI, internals stuff */
  tick: 2000, // setinterval delay
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
};

