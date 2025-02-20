import React from "react";
import {Letter, Transform} from "game/gameTypes"
import styles from "css/stream.module.css";
import * as StreamOps from "game/streamops";

const stylesArr = [
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

const prioOpacity = (prio: number) => {
    if (prio < 6)
        return {}
    else return {
        //opacity: 3/Math.sqrt(prio)
        opacity: 6/(prio)
    }
}

const streamToText = (input: [Array<Letter>, string], index: number, wordIndex?: number) => {
    const letters:Array<Letter> = input[0];
    const word:string = input[1];
    const style = index==0 ? styles.currentWord :(wordIndex ? prioStyle(wordIndex) : styles.prioDefault);
    return (
        <span className={styles.streamWord} key={index}>
            <span className={style} style={prioOpacity(index)}>
                <span className={styles.smallSpace}> &nbsp; </span>
                {letters.map((l: Letter, index: number) =>
                    (l.n > 5) ?
                        <span key={index}>
                            { l.text}
                            <span className={styles.superscript}> {"(" + l.n.toString() + ")"} </span>
                        </span> :
                        <span key={index}>
                            {l.text.repeat(l.n)}
                        </span>
                )}
                {word &&
                    <span className={styles.realWord}>[{word}]</span>}
                <span className={styles.smallSpace}> &nbsp; </span>
            </span>
        </span>);}

interface Props {
    stream: Array<Letter>,
    dict: Array<Transform>,
};

const Stream = ({stream, dict}: Props) => {
    const [streamSplit, streamWords]:[Array<number>, Array<string>] = StreamOps.inputWordSplit(stream, dict);
    let i = 0;
    const separatedStream:Array<[Array<Letter>, string]> = [];
    for (let p = 1 ; p < streamSplit.length ; p++) // first number of streamSplit is always 0
    {
        const k:number = streamSplit[p];
        separatedStream.push([stream.slice(i, k), streamWords[p]]);
        i = k;
    }
    const l:number = separatedStream.length;

    let colorIndex = 1;
    
    return (
        <div className={styles.streamComponent}>
                {separatedStream.reverse()
                                .map((input: [Array<Letter>, string], i:number) => 
                                    streamToText(input, i, input[1].length > 1 ? colorIndex++ : undefined))
                                .reverse()}
        </div>
    )
}

export default Stream;
