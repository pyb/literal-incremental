'use client'

import React, { useEffect } from "react";
import styles from "./css/input.module.css";

// letter or word is null/empty
export type InputItem = {
    letter: string,
    word: string,
    score: number
}

const testPrevInput: Array<InputItem> = [
    { letter: "i", word: "", score: 10 },
    { letter: "n", word: "", score: 10 },
    { letter: "", word: "baz", score: 10 },
    { letter: "", word: "qux", score: 10 },
    { letter: "t", word: "", score: 10 },
];

const testCurrentInput: InputItem = {
    letter: "",
    word: "fol",
    score: 0
};

interface Props {
    prevInput: Array<InputItem>, // previous words/letters typed and scored
    currentInput: InputItem, // word currently being typed (could be letter, prefix or expandable word)
    len: number, // total in characters
};

export const InputArea = ({ prevInput, currentInput, len }: Props) => {
    const prevText: string = prevInput.map((item: InputItem) => item.letter ? item.letter : item.word).join(" ");
    const text: string = prevText.concat(" ",
        currentInput.letter ? currentInput.letter : currentInput.word);
    return (
        <div className={styles.inputArea}>
            <div>{text}</div>
        </div>
    )
}
