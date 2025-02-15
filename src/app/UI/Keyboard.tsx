import React from "react"
import styles from "css/keyboard.module.css"
import {KeyStatus, KeyMode} from "game/gameTypes"
import UIData from "./uiData"

const keyStyle = (modes: Set<KeyMode>) => {
    let result;
    if (modes.has(KeyMode.WordTransformKey)) {
        result = styles.wordBuy;
    }
    else if (modes.has(KeyMode.LetterTranform)) {
        result = styles.wordBuy;
    }
    else if (modes.has(KeyMode.Modifier)) {
        result = styles.modifier;
    }
    else if (modes.has(KeyMode.Unlocked)) {
        result = styles.unlocked;
    }
    else if (modes.has(KeyMode.Visible)) {
        result = styles.visible;
    }
    return result;
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
    //console.log("key")
    //console.log(modes.has(KeyMode.Active))

    if (!modes.has(KeyMode.Active) && highlight) {
        /*
        // needed?
        if (timeoutId != 0)
            window.clearTimeout(timeoutId);
        */
       console.log("off!")
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

    return (
        
            <div className={keyStyle(modes)}>
                <div className={highlight ? styles.highlight : styles.normal}>
                <div className={styles.key}> {text}</div>
            </div>
        </div>);
}

const computeRows = (len:number, mx:number):Array<number> => {
    // Divide in rows.
    const rows = Math.ceil(len / mx);
    const basecols = Math.floor(len / rows);
    const rem = len % rows;
  
    const rowSizes = new Array(rows);
    for (let i = 0 ; i < rows ; i++)
    {
      if (i < rem) 
        rowSizes[i] = basecols + 1;
      else
        rowSizes[i] = basecols;
    }
    return rowSizes;
  }

interface KeyboardProps {
    keyStatus: Map<string, KeyStatus>,
};

const Keyboard = ({keyStatus}:KeyboardProps) => {
    let letterKeys = new Array<string>();
    let specialKeys = new Array<string>();
    
    for (const [key, status] of keyStatus) {
        if (status.modes.has(KeyMode.Modifier) || status.modes.has(KeyMode.WordTransformKey))
            specialKeys.push(key);
        else
            letterKeys.push(key); 
    }

    const rowSizes:Array<number> = computeRows(keyStatus.size, UIData.maxKeyboardRowSize);
    const layeredKeys = new Array<Array<React.ReactNode>>();

    const allKeys = letterKeys.map((key: string) =>
                                <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />);
    for (const size of rowSizes)
    {
        layeredKeys.push(allKeys.splice(0, size));
    }
    return (
        <div className={styles.keyboardComponent}>
            <div className={styles.keyboardTop}>
                <div className={styles.vstack}>
                    {layeredKeys.map((keyRow: Array<React.ReactNode>, index: number) =>
                        <div className={styles.hstack} key={index}>
                            {keyRow}
                        </div>)}
                </div>
            </div>
            <div className={styles.keyboardBottom}>
                <div className={styles.hstack}>
                    {specialKeys.map((key: string) =>
                        <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />)}
                </div>
            </div>
        </div>
    );
}

// <span className={styles.key} key={key}>{key}</span>
export default Keyboard;
