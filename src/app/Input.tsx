import {Letter} from "./GameTypes"
import * as TestUtil from "./testUtil";
import React from "react";
import styles from "./css/input.module.css";

interface Props {
    input: Array<Letter>,
};

const Input = ({input}: Props) => {
    return (
        <div className={styles.inputComponent}>
            {TestUtil.reconvertTestStream(input)}
        </div>
    )
}

export default Input;
