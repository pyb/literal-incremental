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
import {KeyStatus, KeyMode} from "./GameTypes"
import * as Game from "./game"
import * as KH from "./keyboardHandling"
import { useImmer } from "use-immer";
import * as Test from "./testData"

/*
    Functionality in this file:
    -Rendering (Dict, Stream, Keyboard components)
    -Low level keyboard handling
    -Other UI (footer...)
*/

const Footer = ({ glyphs, last }: { glyphs: number, last: string }) => {
    return (
        <>
            <div>{"Glyphs : " + glyphs.toString()}</div>
            <div>{"Last : " + last}</div>
        </>
    );
}

const GameMain = () => {
    const [GS, setGS] = useImmer<GS.GameState>(GameData.initialGameState);

    const keyStatus:Map<string, KeyStatus> = Game.computeKeyStatus(GS.visibleKeys, GS.unlockedKeys, Test.testAvailableKeys);

    // rename this...? calls Game.execute
    const lookupAndExecute = (key:string):void => {
        /*
        const unlocked = unlockedKeys(GS.keyStatus);
        if (unlocked.includes(key))
            setGS(Game.execute(key, GS.keyStatus));
        */
        const status = keyStatus.get(key);
        if (status &&
            (status.modes.has(KeyMode.Available) ||
             status.modes.has(KeyMode.Unlocked))) {
            setGS(Game.execute(key, keyStatus, GS.stream, GS.dict));
        }
    }

    React.useEffect(() => {
        KH.setup(lookupAndExecute);
        return KH.teardown;
      //}, [GS.stream, GS.dict]);
    });
    
    //const availableKeys:Array<string> = Game.getAvailableKeys(GS.stream, GS.dict, UIData.wordTransformKey);

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={[]} lastTransform={Types.emptyTransform}></Dict>
            </div>
            <div className={styles.gameMiddle}>
                <StreamComponent stream={GS.stream} dict={GS.dict} />
                <Keyboard keyStatus={keyStatus} />
            </div>
            <div className={styles.gameFooter}>
                <Footer glyphs={GS.glyphs} last={GS.lastTransform ?
                     (GS.lastTransform.output ? GS.lastTransform.output : GS.lastTransform.input) :
                      ""} />
            </div>
        </div>
    );
}

export default GameMain;