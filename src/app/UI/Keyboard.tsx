import React from "react"
import styles from "css/keyboard.module.css"
import {KeyStatus, KeyMode} from "game/gameTypes"
import UIData from "./uiData"

const keyStyle = (modes: Set<KeyMode>, highlight: boolean=false) => {
    return highlight ? styles.highlight : styles.normal ;
}

/* Highlighting design 
 Activated keyMode : was the key activated recently? It is a transient property. 
 Activated keys : pressed or "activated" = pressed or repeated by us (not browser-repeated)

Put a highlight timer on any activated keys, unless a highlight timer already exists. Simple!
*/

interface KeyProps {
    text: string,
    modes: Set<KeyMode>,
};

const Key = ({text, modes}:KeyProps) => {
    const [highlight, setHighlight] = React.useState<boolean>(false);
    const [timeoutId, setTimeoutId] = React.useState<number>(0);

    const [doProcessHighlight, setDoProcessHighlight] = React.useState<boolean>(false);

    const processHighlight = () => {
        setHighlight(false);
        setTimeoutId(0);
    }

    if (!modes.has(KeyMode.Active) && highlight) {
        setHighlight(false);
    }
    else if (modes.has(KeyMode.Active) && !highlight)
    {
        setHighlight(true);
        if (timeoutId != 0)
            window.clearTimeout(timeoutId);
        const id = window.setTimeout(processHighlight, UIData.highlightDuration);
        setTimeoutId(id);
    }

    if (doProcessHighlight) {
        setDoProcessHighlight(false);
        processHighlight();
      }

      /*
    React.useEffect(() => {
        intervalId.current = window.setInterval(() => setDoProcessHighlight(true),
            UIData.tick);
        return () => {
            window.clearInterval(intervalId.current);
        };
    },[]);
      */

    return (
    <div className={keyStyle(modes, highlight)}>
        <div className={styles.key}> {text}</div>
    </div>);
}

interface KeyboardProps {
    keyStatus: Map<string, KeyStatus>,
};

const Keyboard = ({keyStatus}:KeyboardProps) => {
    let unlockedKeys = new Array<string>();
    let availableKeys = new Array<string>();

    for (const [key, status] of keyStatus) {
        if (status.modes.has(KeyMode.Unlocked))
            unlockedKeys.push(key);
        else if (status.modes.has(KeyMode.Available))
            availableKeys.push(key);
    }

    return (
        <div className="dark">
            <div className={styles.keyboardComponent}>
                <div className={styles.keyRow}>
                    {unlockedKeys.map((key: string) =>
                        <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />)}
                </div>
                <div className={styles.keyRow}>
                    {availableKeys.map((key: string) =>
                        <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />)}
                </div>
            </div>
        </div>
    );
}

// <span className={styles.key} key={key}>{key}</span>
export default Keyboard;
