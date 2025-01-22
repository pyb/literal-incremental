export type KeyInfo = {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

export type ShopEntry = {
  text: string,
  id: string,
  position: number,
  visibilityPrice: number,
  price: number
}

/*
interface IGameData {
  keyInfo: Array<KeyInfo>,
  shopEntries:Array<ShopEntry>
}
*/

export const GameData =
{
    highlightDuration: 150,
    //maxWordLength: 4,
    inputSize: 20,
    dict: ['i', 'sin', 'is', 'in', 'si'],

    tick: 30, // setinterval delay

    // This is obsolete. keys no longer have a key-specific price. And prob same goes for repeaterPrice(?)
    keyInfo: [
    { key: 'i', visibilityPrice: 0, price: 0, repeaterPrice: 500 },
    { key: 's', visibilityPrice: 1,  price: 100, repeaterPrice: 5000 },
    { key: 'n', visibilityPrice: 1, price: 200, repeaterPrice: 50000 },
    { key: 'c', visibilityPrice: 200, price: 300, repeaterPrice: 500000 },
    { key: 'h', visibilityPrice: 350, price: 500, repeaterPrice: 5000000 },
    { key: 'o', visibilityPrice: 600, price: 750, repeaterPrice: 50000000 },
    { key: 'r', visibilityPrice: 800, price: 1000, repeaterPrice: 500000000 }
    ],

    shopEntries: [
      {text: "Booster1", id: "booster1", position: 0, visibilityPrice: 10, price: 40},
      {text: "Booster2", id: "booster2", position: 10, visibilityPrice: 11, price: 50},
    ],
  };
//} as IGameData;
