'use client'

import React from "react"
import styles from "./css/game.module.css"
import Dict from "./Dict"
import Keyboard from "./Keyboard"
import Input from "./Input"
import * as GS from "./GameState"
import * as GameData from "./GameData"
import * as UIData from "./UIData"
import * as Stream from "./stream"
import {Transform} from "./GameTypes"

const Footer = () => {
    return (
        <>Footer</>
    );
}

const getAvailableKeys = (input:Array<Letter>, dict: Array<Transform>):Array<string> => {
    const result:Array<string> = [];
    
    const letters = Stream.scanForLetters(input, dict);
    Array.from(letters.keys()).forEach((key) => result.push(key));

    console.log("words:")
    console.log(input)
    console.log(dict)
    const words = Stream.scanForWords(input, dict);
    
    console.log(words)
    if (words.length > 0)
        result.push(UIData.WordTransformKey);

    return result;
}

const Game = () => {
    const [GS, setGS] = React.useState<GS.GameState>(GameData.initialGameState);

    // Run only once
    React.useEffect(() => {
        // ...
      }, []);
    
    const availableKeys:Array<string> = getAvailableKeys(GS.input, GS.dict);
    
    return (
        <>
            <div className={styles.game}>
                <div className={styles.gameTop}>
                    <Dict></Dict>
                </div>
                <div className={styles.gameMiddle}>
                    <Input input={GS.input} />
                    <Keyboard availableKeys={availableKeys} unlockedKeys={GS.unlockedKeys} />
                </div>
                <div className={styles.gameFooter}>
                    <Footer></Footer>
                </div>
            </div>
        </>);
}

export default Game;