// Still needed?
/*
    Input data structure:
    Array of InputItem
*/
/*
export type InputItem = {
    text: string,
    finished: boolean,
    isLetter: boolean,
    isWord: boolean,
    // isPrefix = !isLetter & !isWord 
    n: number, // >= 1
}
*/

export type Letter = {
    text: string,
    n: number, // >= 1
}

// Triggers on n times word or letter. 
// Or "combo"?
export type Transform = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n: number,
    input: string, // word or letter
    output: string
};

export type TransformLocation = 
{
    id: number,
    word: string, // combo word or letter
    // n: number, // not required
    location: number,
}
