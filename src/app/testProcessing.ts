// Test with: npx tsx ./testProcessing.ts

// test data
//const testInput1:string = "fobarfooinnhousesquirebabazin";
//const testWords1:Array<string> = ["foo", "bar", "baz", "house", "fun", "squire", "in", "inn"];


function sreverse(s:string):string{
    return s.split("").reverse().join("");
}

type Letter = {
    text: string,
    n: number, // >= 1
}

const testInputS:string = "fobar(5)f(3)o(3)o(3)in(13)nbazhousesqui(10)rebaba(3)zi(5)n";
let testInput:Array<Letter> = [];
const len = testInputS.length;
console.log("len: " + len.toString())

const convertTestInput = () => {
    for (let i: number = 0; i < len;) {
        const letter = testInputS[i];
        if (!letter)
        {
            throw new Error('Bug: array out of bounds');
        }
        if (i > (len - 3) || testInputS[i + 1] != "(") {
            testInput.push({ text: letter, n: 1 });
            i++;
        }
        else {
            let k = i + 2;
            while (testInputS[k] != ")") {
                k++;
            }

            const n = Number(testInputS.slice(i + 2, k));
            testInput.push({ text: letter, n: n });
            i = k + 1;
        }
    }
}

// Triggers on n times word or letter. These will be DictItems in the future
type Combo = {
    n: number,
    input: string, // word or letter
    output: string,
};

// Compute
const testCombos:Array<Combo> = [
    {n: 10, input: "i", output:"n"},
    {n: 10, input: "n", output:"e"},
    {n: 1, input: "win", output:"!"},
    {n: 1, input: "in", output:""},
    {n: 1, input: "foo", output:"bar"},
    {n: 1, input: "baz", output:""},
    {n: 3, input: "bar", output:"w"},
];

type LetterComboPosition = {
    id: number,
    pos: number
};

//Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
const scanForLetters = (input: Array<Letter>, combos: Array<Combo>):Array<LetterComboPosition> => {
    let result:Array<LetterComboPosition> = [];
    combos.forEach((combo: Combo, index: number) => {
        const comboLetter = combo.input;
        if (comboLetter.length == 1) {
            input.forEach((letter: Letter, k: number) => {
                if ((letter.text == comboLetter) &&
                    (letter.n >= combo.n)) {
                    result.push({ id: index, pos: k })
                }
            });
        }
    });
    return result;
}

// Kinda do this, but backwards
const scanS = (input:string, words:Array<string>) =>{
    // Return positions of words in input
    let result:Map<string, number>= new Map<string, number>();
    for (const w of words)
    {
        const k = input.indexOf(w) 
        if (k !== -1)
            result.set(w,k);
    }
}

/*
Hash table W update : {Dict Item ID -> [location indices in S, from right to left]}
And ID/location of the rightmost Dict Item. Or maybe a list of all the Dict Item IDs present, in order! There is overlap though.
bc What does Enter buy ? rightmost "Word" Dict Item
*/
type WordComboPosition = 
{
    id: number,
    word?: string
    location: number,
    // n: number, // not required
}

const inputToString = (input: Array<Letter>):string => {
    const result:string = input.map((letter: Letter) => letter.text).join('');
    return result;
}

// 2 strats:
// 1) Create a trie from all the words in word combos. Iterate over input and for each position,
//   look for all available words in the trie
const scanForWords1 = (input: Array<Letter>, combos: Array<Combo>):Array<WordComboPosition> => {
    const wordCombos = combos.filter((combo) => combo.input.length > 1);

    let result:Array<WordComboPosition> = [];
//TODO

    return result;
}

// 2) For each word in the combo, look for its last occurence in the input
const scanForWords2 = (input: Array<Letter>, combos: Array<Combo>):Array<WordComboPosition> => {
    const revInputS:string = inputToString(input.reverse());
    const wordCombos = combos.filter((combo) => combo.input.length > 1);

    console.log(revInputS.length)
    let result:Array<WordComboPosition> = [];

    wordCombos.forEach((combo:Combo, index: number) => {
        const word = combo.input;
        const revWord = sreverse(word);
        const i = revInputS.indexOf(revWord);
        if (i != -1)
        {
            const pos = (input.length - i) - word.length;
            result.push({id: index, location: pos, word: word})
        }
    });

    return result;
}

console.log(testInputS)
convertTestInput();
//console.log(testInput)
console.log(testCombos)

//const letterCombos = scanForLetters(testInput, testCombos);
//console.log("letter combos:");
//console.log(letterCombos)

const wordCombos = scanForWords2(testInput, testCombos);
console.log("word combos:");
console.log(wordCombos);
