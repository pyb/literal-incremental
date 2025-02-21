import React from "react";
import {Letter, Transform, Word} from "game/gameTypes"
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
        return {};
    else return {
        opacity: 6/(prio)
    };
}

const wordToElement = (input: [Array<Letter>, string, boolean], idx: number, wordIndex?: number) => {
    if( idx == 1)
        console.log(input[0].length)
    const word: Array<Letter> = input[0];
    const wordS: string = input[1];
    const destroyed: boolean = input[2];
    const style = destroyed ? styles.deadWord :
                ( (idx == 0) ? styles.currentWord : 
                ( wordIndex ? prioStyle(wordIndex) : styles.prioDefault) );
    return (
        <span className={styles.streamWord} key={idx}>
            <span className={style} style={prioOpacity(idx)}>
                <span className={styles.smallSpace}> &nbsp; </span>
                {word.map((l: Letter, i: number) =>
                    (l.n > 5) ?
                        <span key={i}>
                            {l.text}
                            <span className={styles.superscript}> {"(" + l.n.toString() + ")"} </span>
                        </span> :
                        <span key={i}>
                            {l.text.repeat(l.n - 1)}
                            <span className={styles.lastLetter}>{l.text}</span>
                        </span>
                )}
                {wordS &&
                    <span className={styles.realWord}>[{wordS}]</span>}
                <span className={styles.smallSpace}> &nbsp; </span>
            </span>
        </span>
    );
}

interface Props {
    stream: Array<Letter>,
    dict: Array<Transform>,
    lastDestroyedWord:Word|undefined,
    destroyedLocation: number,
};

const Stream = ({stream, dict, lastDestroyedWord, destroyedLocation}: Props) => {
    const [streamSplit, streamWords]:[Array<number>, Array<string>] = StreamOps.inputWordSplit(stream, dict);
    let i = 0;
    const separatedStream:Array<[Array<Letter>, string, boolean]> = [];

    for (let p = 1 ; p < streamSplit.length ; p++) // first number of streamSplit is always 0
    {
        const k:number = streamSplit[p];
        if ( lastDestroyedWord && destroyedLocation  >= i && destroyedLocation < k )
        {
            //console.log(lastDestroyedWord)
            //separatedStream.push([lastDestroyedWord, "", true]);
        }
          
        separatedStream.push([stream.slice(i, k), streamWords[p], false]);
        i = k;
    }

    let colorIndex = 1;
    return (
        <div className={styles.streamComponent}>
                {separatedStream.reverse()
                                .map((input: [Array<Letter>, string, boolean], i:number) => 
                                    wordToElement(input,
                                                  i,
                                                  input[1].length > 1 ? colorIndex++ : undefined))
                                .reverse()}
        </div>
    )
}

export default Stream;
