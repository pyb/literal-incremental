'use client'

import styles from "./css/game.module.css"

import { LogItem } from "./GameTypes";

interface Props {
    log: Array<LogItem>;
};

// Log area a la Paperclips
const Log = ({ log }: Props) => {
    const l = log.length;
    return (
        <ul className={styles.log}>
            {log.slice(0, l - 1).map(
                (logItem: LogItem) => <li key={logItem.key}><span>&nbsp;.&nbsp;</span><span>{logItem.text}</span></li>
            )}
            <li className={styles.lastLog} key={log[l-1].key}><span>&nbsp;&gt;&nbsp;</span><span>{log[l-1].text}</span></li>
        </ul>);
}

export default Log;
