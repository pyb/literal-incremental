'use client'

import React from "react"
import { useImmer } from "use-immer";
import styles from "css/game.module.css"
import Dict from "UI/Dict"
import Keyboard from "UI/Keyboard"
import StreamComponent from "UI/Stream"
import * as GS from "game/gameState"
import GameData from "game/gameData"
import uiData from "UI/uiData"
import * as Types from "game/gameTypes"
import {KeyStatus, KeyMode} from "game/gameTypes"
import * as Game from "game/game"
import * as KH from "game/keyboardHandling"
import * as Test from "test/testData"
import RCScout from "UI/RCScout";

/*
    Functionality in this file:
    -Rendering (Dict, Stream, Keyboard components)
    -Low level keyboard handling
    -Other UI (footer...)
*/

const Reset = ({ resetCallback }: { resetCallback: () => void }) => {
    return (
        <div className={styles.button}>
            <button className={styles.reset} onClick={resetCallback}>
                Reset
            </button>
        </div>
    );
}

interface DebugProps {
    glyphs: number,
    last: string,
}

const Debug = ({ glyphs, last }: DebugProps) => {
    return (
        <>
            <div>{"Glyphs : " + glyphs.toString()}</div>
            <div>{"Last : " + last}</div>
        </>
    );
}

const Footer = ({items}: {items: Array<React.ReactNode>}) => {
    const [idx, setIdx] = React.useState<number>(0);

    const n = items.length;

    const rotate = () => {  
      setIdx(((idx + 1) % n));
    };
  
    return (
      <div className={styles.footer}>
        <div className={styles.footerContent}>{items[idx]}</div>
        <button className={styles.footerButton} onClick={rotate}> More... </button>
      </div>);
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
    const resetCallback = () => {
        setGS(GameData.initialGameState);
    }

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={GS.dict} lastTransform={Types.emptyTransform}></Dict>
            </div>
            <div className={styles.gameMiddle}>
                <StreamComponent stream={GS.stream} dict={GS.dict} />
                <Keyboard keyStatus={keyStatus} />
            </div>
            <div className={styles.gameFooter}>
                <Footer items={[
                    ///<Log key={0} log={GS.log}></Log>,
                    <button key={1} className={styles.reset} onClick={resetCallback}>Reset</button>,
                    <RCScout key={2} />,
                    <Debug key={3}
                           glyphs={GS.glyphs}
                           last={GS.lastTransform ?
                            (GS.lastTransform.output ? GS.lastTransform.output : GS.lastTransform.input) :
                            ""} />
                            
                ]} />
      
            </div>
        </div>
    );
}

export default GameMain;