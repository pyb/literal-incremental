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

const streamToText = (input:Array<Letter>, index:number) => {
    return (<span className={prioStyle(index)} style={prioOpacity(index)} key={index}>
        <span key={0}>{" "}</span>
        {input.map((l:Letter, index:number) =>
        <span key={index+1}>
            <span>
                { l.text }
            </span>
            {(l.n > 1) && 
            <span className={styles.superscript}> {"(" + l.n.toString() + ")"} </span> }
        </span>
            )}
        </span>);
}

interface Props {
    stream: Array<Letter>,
    dict: Array<Transform>,
};

const Stream = ({stream, dict}: Props) => {
    const streamText:string = stream.map((l:Letter) => l.text).join("");
    const streamSplit:Array<number> = StreamOps.inputWordSplit(streamText, dict);

    let i = 0;
    const separatedStream:Array<Array<Letter>> = [];
    for (const k of streamSplit) {
        separatedStream.push(stream.slice(i, k));
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
