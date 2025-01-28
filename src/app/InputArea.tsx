'use client'

import React, { useEffect } from "react";
import styles from "./page.module.css";

// Adding a temporary basic InputArea to enable the implementation of word typing.
const InputArea = ({ input }: { input: string }) => {
    return (
        <div className={styles.inputArea}>
            <span>{input}</span>
        </div>
    )
}

export default InputArea;
