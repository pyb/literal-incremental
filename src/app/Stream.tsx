import {Letter, Transform} from "./GameTypes"
import React from "react";
import styles from "./css/input.module.css";
import * as StreamOps from "./streamops";
import * as TestUtil from "./testUtil";

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
    return (
        <div className={styles.inputComponent}>
            {separatedStream.map(TestUtil.reconvertTestStream).join(" ")}
        </div>
    )
}

export default Stream;
