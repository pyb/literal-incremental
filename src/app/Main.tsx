'use client'

import React from "react"
import styles from "./css/game.module.css"
import Dict from "./Dict"
import Keyboard from "./Keyboard"
import StreamComponent from "./Stream"
import * as GS from "./GameState"
import GameData from "./GameData"
import UIData from "./UIData"
import * as Types from "./GameTypes"
import * as Game from "./game"
import * as KH from "./keyboardHandling"
import { useImmer } from "use-immer";

/*
    Functionality in this file:
    -Rendering (Dict, Stream, Keyboard components)
    -Low level keyboard handling
    -Other UI (footer...)
*/

const Footer = () => {
    return (
        <>Footer</>
    );
}

const unlockedKeys = (keyStatus: Map<string, Types.KeyStatus>):Array<string> => {
    let result = new Array<string>();
    for (const [key, status] of keyStatus) {
        if (status.modes.has(Types.KeyMode.Unlocked))
            result.push(key);
    }
    return result;
}

const GameMain = () => {
    const [GS, setGS] = useImmer<GS.GameState>(GameData.initialGameState);

    // rename this...? calls Game.execute
    const lookupAndExecute = (key:string):void => {
        const unlocked = unlockedKeys(GS.keyStatus);
        if (unlocked.includes(key))
            setGS(Game.execute(key, GS.keyStatus));
    }

    // Run only once
    React.useEffect(() => {
        KH.setup(lookupAndExecute);
        return KH.teardown;
      }, [GS.keyStatus]);
    
    const availableKeys:Array<string> = Game.getAvailableKeys(GS.stream, GS.dict, UIData.wordTransformKey);

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={[]} lastTransform={Types.emptyTransform}></Dict>
            </div>
            <div className={styles.gameMiddle}>
                <StreamComponent stream={GS.stream} />
                <Keyboard availableKeys={availableKeys} unlockedKeys={unlockedKeys(GS.keyStatus)} />
            </div>
            <div className={styles.gameFooter}>
                <Footer></Footer>
            </div>
        </div>
    );
}

export default GameMain;