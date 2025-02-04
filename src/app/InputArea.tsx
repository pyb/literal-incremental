'use client'

// TODO: extra display for: last word scored, current prefix.

import React from "react";
import styles from "./css/input.module.css";
import { InputItem } from "./GameTypes"

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
    partialInput: InputItem, // word currently being typed (could be letter, prefix or expandable word)
};

const InputArea = ({ prevInput, partialInput }: Props) => {
    /*
    const prevText: string = prevInput.map((item: InputItem) => item.letter ? item.letter : item.word).join(" ");
    const text: string = prevText.concat(" ",
        partialInput.letter ? partialInput.letter : partialInput.word);
    */

    //console.log(prevInput);
    //console.log(partialInput);
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

    const spans: Array<React.ReactNode> = prevInputWithPriority.map ((item: InputItem, index) => {
        let text:string;

        if (item.word) 
            text = item.word;
        else if (item.prefix)
            text = item.prefix;
        else
            text = item.letter || '';

        text = text.concat(" ");
        const style:string = item.order ? prioStyle(item.order) : styles.letter;

        return (<span key={index+10} className={style}>{text}</span>);
    });

    const currentSpans:Array<React.ReactNode> = [];

    if (partialInput.letter) {
        currentSpans.push(<span className={styles.firstLetter} key={1}>{partialInput.letter}</span>);
    }
    else if (partialInput.word || partialInput.prefix) {
        const word = partialInput.word ? partialInput.word : (partialInput.prefix || '');

        const start = word.slice(0, -2); // anything but the last 2 letters
        const prevLast = word.slice(word.length - 2, -1); // second to last letter
        const last = word.slice(word.length - 1); // last letter

        if (start)
            currentSpans.push(<span className={styles.firstWord} key={1}>{start} </span>);
        if (prevLast)
            currentSpans.push(<span className={styles.firstWordSecondLast} key={2}>{prevLast} </span>);
        currentSpans.push(<span className={styles.firstWordLast} key={3}>{last} </span>);
    }
    else {
        // partialInput can be empty
    }

    return (
        <div className={styles.inputArea}>
            <div className={styles.inputText}>
                <>
                    {spans.reverse()}
                    {(currentSpans.length == 0) ? null : (<span key={0}>{currentSpans}</span>)}
                </>
            </div>
        </div>
    )
}

export default InputArea;
