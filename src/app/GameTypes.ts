export type Letter = {
    text: string,
    n: number, // >= 1
}

// Triggers on n times word or letter. 
export type Transform = {
    id: number,
    longDesc?: string,
    shortDesc?: string,
    n: number,
    input: string, // word or letter
    output: string
};

export type TransformLocation = {
    id: number,
    word: string, // combo word or letter
    // n: number, // not required
    location: number,
}
