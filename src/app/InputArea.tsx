'use client'

import React, { useEffect } from "react";
import styles from "./css/input.module.css";

// Adding a temporary basic InputArea to enable the implementation of word typing.

interface Props {
    input: string;
};

const InputArea = ({ input }: Props) => {
    return (
        <div className={styles.inputArea}>
            <div>{input}</div>
        </div>
    )
}

export default InputArea;
