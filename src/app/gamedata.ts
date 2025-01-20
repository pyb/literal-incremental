export type KeyInfo = {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

export const GameData =
{
    highlightDuration: 150,
    maxWordLength: 4,
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

    B1VisPrice: 30,
    B1Price: 100,

    B2VisPrice: 100,
    B2Price: 300,
};
