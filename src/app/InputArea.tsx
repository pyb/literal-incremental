'use client'

// TODO: extra display for: last word scored, current prefix.

import React, { useEffect } from "react";
import styles from "./css/input.module.css";

// letter or word is null/empty
export type InputItem = {
    letter: string,
    word: string,
    score: number,
    key: number,
    order?: number
};

const stylesArr: Array<string> = [
    "",
    styles.prio1,
    styles.prio2,
    styles.prio3,
    styles.prio4,
    styles.prio5,
    styles.prio6,
];

const prioStyle = (prio: number) => {
    if (prio < stylesArr.length)
        return stylesArr[prio];
    else
        return styles.prioDefault;
}

interface Props {
    prevInput: Array<InputItem>, // previous words/letters typed and scored
    currentInput: InputItem, // word currently being typed (could be letter, prefix or expandable word)
};

export const InputArea = ({ prevInput, currentInput }: Props) => {
    /*
    const prevText: string = prevInput.map((item: InputItem) => item.letter ? item.letter : item.word).join(" ");
    const text: string = prevText.concat(" ",
        currentInput.letter ? currentInput.letter : currentInput.word);
    */

    let prio = 1;
    const prevInputWithPriority: Array<InputItem> = prevInput.map(
        (item: InputItem):InputItem => {
            let order:number = NaN;
            if (item.word) {
                order = prio;
                prio++;
            }
            return ({...item, order: order});
        });

    const spans: Array<React.ReactNode> = prevInputWithPriority.map ((item: InputItem) => {
        const text:string = (item.word ? item.word : item.letter).concat(" ");
        const style:string = item.order ? prioStyle(item.order) : styles.letter;

        return (<span key={item.key} className={style}>{text}</span>);
    });

    const currentSpans:Array<React.ReactNode> = [];

    if (currentInput.letter) {
        currentSpans.push(<span className={styles.firstLetter} key={0}>{currentInput.letter}</span>);
    }
    else if (currentInput.word) {
        const start = currentInput.word.slice(0, -2); // anything but the last 2 letters
        const prevLast = currentInput.word.slice(currentInput.word.length - 2, -1); // second to last letter
        const last = currentInput.word.slice(currentInput.word.length - 1); // last letter

        if (start)
            currentSpans.push(<span className={styles.firstWord} key={0}>{start} </span>);
        if (prevLast)
            currentSpans.push(<span className={styles.firstWordSecondLast} key={1}>{prevLast} </span>);
        currentSpans.push(<span className={styles.firstWordLast} key={2}>{last} </span>);
    }
    else {
        // currentInput can be empty
    }

    return (
        <div className={styles.inputArea}>
            <div className={styles.inputText}>
                <>
                    {spans.reverse()}
                    {(currentSpans.length == 0) ? null : (<span key={currentInput.key}>{currentSpans}</span>)}
                </>
            </div>
        </div>
    )
}
