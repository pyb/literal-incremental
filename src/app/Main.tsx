'use client'

import React from "react"
import styles from "./css/game.module.css"
import Dict from "./Dict"
import Keyboard from "./Keyboard"
import StreamComponent from "./Stream"
import * as GS from "./GameState"
import * as GameData from "./GameData"
import * as UIData from "./UIData"
import * as GT from "./GameTypes"
import * as Game from "./game"

const Footer = () => {
    return (
        <>Footer</>
    );
}

const GameMain = () => {
    const [GS, setGS] = React.useState<GS.GameState>(GameData.initialGameState);

    // Run only once
    React.useEffect(() => {
        // ...
      }, []);
    
    const availableKeys:Array<string> = Game.getAvailableKeys(GS.stream, GS.dict, UIData.WordTransformKey);

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={[]} lastTransform={GT.emptyTransform}></Dict>
            </div>
            <div className={styles.gameMiddle}>
                <StreamComponent stream={GS.stream} />
                <Keyboard availableKeys={availableKeys} unlockedKeys={GS.unlockedKeys} />
            </div>
            <div className={styles.gameFooter}>
                <Footer></Footer>
            </div>
        </div>
    );
}

export default GameMain;