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
    if (prio < 10)
        return {}
    else return {
        //opacity: 3/Math.sqrt(prio)
        opacity: 10/(prio)
    }
}

const streamToText = (input: [Array<Letter>, string], index: number) => {
    const letters:Array<Letter> = input[0];
    const word:string = input[1];
    //console.log(letters);
    //console.log(word)
    return (
        <span className={styles.streamWord} key={index}>
            <span className={prioStyle(index)} style={prioOpacity(index)}>
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
//    console.log(streamSplit)
    console.log(streamWords)
    let i = 0;
    const separatedStream:Array<[Array<Letter>, string]> = [];
    for (let p = 1 ; p < streamSplit.length ; p++) // first number of streamSplit is always 0
    {
        const k:number = streamSplit[p];
        separatedStream.push([stream.slice(i, k), streamWords[p]]);
        i = k;
    }
    const l:number = separatedStream.length;

    return (
        <div className={styles.streamComponent}>
                {separatedStream.reverse().map(streamToText).reverse()}
        </div>
    )
}

export default Stream;
