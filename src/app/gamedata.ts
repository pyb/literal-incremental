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
      {text: "Unlock a Letter", id: "letterunlock1", position: 0, visibilityPrice: 10, price: 40},
      {text: "Unlock another Letter", id: "letterunlock2", position: 10, visibilityPrice: 500, price: 4000},
      {text: "Unlock Word formation", id: "wordunlock", position: 20, visibilityPrice: 100, price: 400},
      {text: "Unlock 2-letter Words", id: "wordunlock2", position: 130, visibilityPrice: 200, price: 2000},
      {text: "Unlock 3-letter Words", id: "wordunlock3", position: 140, visibilityPrice: 200, price: 2000},
      {text: "Unlock 4-letter Words", id: "wordunlock4", position: 150, visibilityPrice: 2000, price: 6000},
      {text: "Unlock a third Letter", id: "letterunlock3", position: 200, visibilityPrice: 5000, price: 40000},
      {text: "Unlock a Repeater", id: "repeaterunlock1", position: 300, visibilityPrice: 4000, price: 8000},

    ],
  };
