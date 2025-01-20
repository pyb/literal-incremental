interface KeyInfo {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

const GameData =
{
    highlightDuration: 150,
    maxWordLength: 4,
    inputSize: 20,
    adict: ['i', 'sin', 'is', 'in', 'si'],

    keyInfo: [
    { key: 'i', visibilityPrice: 0, price: 0, repeaterPrice: 500 },
    { key: 's', visibilityPrice: 10,  price: 100, repeaterPrice: 5000 },
    { key: 'n', visibilityPrice: 150, price: 200, repeaterPrice: 50000 },
    { key: 'c', visibilityPrice: 200, price: 300, repeaterPrice: 500000 },
    { key: 'h', visibilityPrice: 350, price: 500, repeaterPrice: 5000000 },
    { key: 'o', visibilityPrice: 600, price: 750, repeaterPrice: 50000000 },
    { key: 'r', visibilityPrice: 800, price: 1000, repeaterPrice: 500000000 }
    ],   

};

export default GameData;

