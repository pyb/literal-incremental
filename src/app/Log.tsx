'use client'

import React, { useEffect } from "react";
import styles from "./page.module.css"

// Log area a la Paperclips
const Log = ({ log }: { log: Array<string> }) => {
    const l = log.length;
    return (
        <ul className={styles.log}>
            {log.slice(0, l-1).map(
                (logItem: string) => <li><span>&nbsp;.&nbsp;</span><span>{logItem}</span></li>
            )}
            <li className={styles.lastLog}><span>&nbsp;&gt;&nbsp;</span><span>{log[l-1]}</span></li>
        </ul>);
}

export default Log;


