import React from "react";
import {Letter, Transform, Word} from "game/gameTypes"
import styles from "css/stream.module.css";
import * as StreamOps from "game/streamops";
import { CSSTransition } from 'react-transition-group';
import * as UIData from "UI/uiData";
import * as GameData from "game/gameData";

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

interface WordProps {
    input: [Array<Letter>, string, boolean, number],
    idx: number,
    wordIndex: number|undefined,
} 

const wordStyle = (idx:number, destroyed: boolean, wordIndex:number|undefined, word:string ) => {
    if (destroyed)
        return styles.deadWord;
    else if (idx == 0)
        return styles.currentWord;
    else if (word == GameData.tombStone)
        return styles.tombstone;
    else if (wordIndex)
        return prioStyle(wordIndex)
    else 
        return styles.prioDefault;
}

let c = 100000;

const WordComponent = ({input, idx, wordIndex}:WordProps) => {
    const nodeRef = React.useRef(null);
    const word: Array<Letter> = input[0];
    const wordS: string = input[1];
    const destroyed: boolean = input[2];
    const destroyedIdx: number = input[3];

    const style = wordStyle(idx, destroyed, wordIndex, wordS);

    return (
        <CSSTransition nodeRef={nodeRef} in={true} timeout={200} classNames="destroy">
            <span className={styles.streamWord} key={destroyed ? c++ + (destroyedIdx as number) : idx}>
                <span className={style} style={prioOpacity(idx)}>
                    {!destroyed && <span className={styles.smallSpace}> &nbsp; </span>}
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
                    {!destroyed && <span className={styles.smallSpace}> &nbsp; </span>}
                </span>
            </span>
        </CSSTransition>
    );
}

interface Props {
    stream: Array<Letter>,
    dict: Array<Transform>,
    lastDestroyedWord:Word|undefined,
    destroyedLocation: number,
    destroyedWordId: number,
};

const Stream = ({stream, dict, lastDestroyedWord, destroyedLocation, destroyedWordId}: Props) => {
    const [streamSplit, streamWords]:[Array<number>, Array<string>] = StreamOps.inputWordSplit(stream, dict);
    let i = 0;
    const separatedStream:Array<[Array<Letter>, string, boolean, number]> = [];

    for (let p = 1 ; p < streamSplit.length ; p++) // first number of streamSplit is always 0
    {
        const k:number = streamSplit[p];
        if ( lastDestroyedWord && destroyedLocation  >= i && destroyedLocation < k )
        {
            separatedStream.push([lastDestroyedWord, "", true, destroyedWordId]);
        } 
        separatedStream.push([stream.slice(i, k), streamWords[p], false, 0]);
        i = k;
    }

    let colorIndex = 1;
    return (
        <div className={styles.streamComponent}>
                {separatedStream.reverse()
                                .map((input: [Array<Letter>, string, boolean, number], i:number) => 
                                    <WordComponent
                                          input={input}
                                          idx={i}
                                          key={i}
                                          wordIndex={input[1].length > 1 ? colorIndex++ : undefined} />)
                                .reverse()}
        </div>
    )
}

export default Stream;
