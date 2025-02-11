import {Letter} from "./GameTypes"
import * as TestUtil from "./testUtil";
import React from "react";
import styles from "./css/input.module.css";

interface Props {
    stream: Array<Letter>,
};

const Stream = ({stream}: Props) => {
    return (
        <div className={styles.inputComponent}>
            {TestUtil.reconvertTestStream(stream)}
        </div>
    )
}

export default Stream;
