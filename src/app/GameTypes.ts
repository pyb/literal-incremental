// Triggers on n times word or letter.

export type DictItem = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n: number,
    input: string, // word or letter
    output: string
};

/*
    Input data structure:
    Array of InputItem

*/
export type InputItem = {
    text: string,
    finished: boolean,
    isLetter: boolean,
    isWord: boolean,
    // isPrefix = !isLetter & !isWord 
    n: number, // >= 1

}
