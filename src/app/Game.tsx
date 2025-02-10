'use client'

import React from "react"
import styles from "./css/game.module.css"
import Dict from "./Dict"
import Keyboard from "./Keyboard"
import Input from "./Input"
import * as GS from "./GameState"
import * as GameData from "./GameData"
import * as Test from "./test";

const Footer = () => {
    return (
        <>Footer</>
    );
}

const Game = () => {
    const [GS, setGS] = React.useState<GS.GameState>(GameData.initialGameState);

    React.useEffect(() => {
        for (const s of Test.testStream())
        {
            console.log(s);
            console.log('\n');
        }
      }, []);

    return (
        <>
            <div className={styles.game}>
                <div className={styles.gameTop}>
                    <Dict></Dict>
                </div>
                <div className={styles.gameMiddle}>
                    <Input></Input>
                    <Keyboard></Keyboard>
                </div>
                <div className={styles.gameFooter}>
                    <Footer></Footer>
                </div>
            </div>
        </>
    )
}

export default Game;