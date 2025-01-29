'use client'

import React, { useEffect } from "react";
import styles from "./game.module.css";

// Adding a temporary basic InputArea to enable the implementation of word typing.


interface Props {
    input: string;
};

const InputArea = ({ input }: Props) => {
    return (
        <div className={styles.inputArea}>
            <span>{input}</span>
        </div>
    )
}

export default InputArea;
