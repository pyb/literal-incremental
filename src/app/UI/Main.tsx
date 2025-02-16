'use client'

import React from "react"
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
enableMapSet(); // immer setup call, to make Maps and Sets work

import styles from "css/game.module.css"
import Dict from "UI/Dict"
import Keyboard from "UI/Keyboard"
import StreamComponent from "UI/Stream"
import * as GameData from "game/gameData"
import * as Types from "game/gameTypes"
import {KeyStatus, KeyMode, GameState} from "game/gameTypes"
import * as Game from "game/game"
import * as KH from "game/keyboardHandling"
import RCScout from "UI/RCScout";
import Log from "./Log"
import UIData from "./uiData";
import { load, save } from "game/persist";

/*
    Functionality in this file:
    -Rendering (Dict, Stream, Keyboard components)
    -Low level keyboard handling
    -Other UI (footer...)
*/

interface DebugProps {
    glyphs: number,
    last: string,
    speedupCallback: () => void,
    repeatDelay: number,
}

const Debug = ({ glyphs, last, speedupCallback, repeatDelay }: DebugProps) => {
    return (
        <div className={styles.debug}>
            <div>{"Glyphs : " + glyphs.toString()}</div>
            <div>{"Last : " + last}</div>
            <button key={2} className={styles.reset} onClick={speedupCallback}>{(repeatDelay == GameData.fastRepeat)? " Slower" : "Faster"}</button>
        </div>
    );
}

const Footer = ({items}: {items: Array<React.ReactNode>}) => {
    const [idx, setIdx] = React.useState<number>(0);

    const n = items.length;

    const rotate = () => {  
      setIdx(((idx + 1) % n));
    };
  
    return (
      <div className={styles.footer} onClick={rotate}>
        <div className={styles.footerContent}>{items[idx]}</div>
      </div>);
}

const GameMain = () => {
    const [GS, setGS] = useImmer<GameState>(GameData.initialGameState);
    const [timeoutIds, setTimeoutIds] = useImmer<Map<string, number>>(new Map<string, number>);
    const [doProcessInterval, setDoProcessInterval] = React.useState<boolean>(false);

    const intervalId = React.useRef<number>(0);

    // Could I create a GS.keyStatus variable and put this calculation behind useEffect to avoid creating 
    // a new keyStatus every frame, and re-rendering Keyboard every frame? Useful, possible?

    const keyStatus:Map<string, KeyStatus> = Game.computeKeyStatus(GS.visibleKeys,
                                                                   GS.unlockedKeys,
                                                                   GS.pressedKeys,
                                                                   GS.stream,
                                                                   GS.dict);

    // TODO rename this...? calls Game.execute
    // and find a better place for all the code below

    // Have 1 per-key jstimeoutid in state
    // Create a timeout event according to key's repeat delay
    // Delete the timeout event if key released
    const processTimeout = (key: string) => {
        if (timeoutIds.has(key)) {
            window.clearTimeout(timeoutIds.get(key));
            setTimeoutIds((timeoutIds) => {
                timeoutIds.delete(key);
            });
        }
        setGS((gs:GameState) => {
            gs.pressedKeys.delete(key);
        });
        lookupAndExecute(key, false);
    }

    const lookupAndExecute = (key:string, release:boolean):void => {
        const status = keyStatus.get(key);
        if (release) {
            if (timeoutIds.has(key)) {
                window.clearTimeout(timeoutIds.get(key));
                setTimeoutIds((timeoutIds) => {
                    timeoutIds.delete(key);
                });
            }
            setGS((gs:GameState) => {
                gs.pressedKeys.delete(key);
            });
        }
        else {
            if (status &&
                (status.modes.has(KeyMode.Available) ||
                 status.modes.has(KeyMode.Unlocked))) {
                setGS((gs:GameState) => {
                    gs.pressedKeys.add(key);
                 });
                const update = Game.execute(key, keyStatus, GS.stream, GS.dict);
                if (update)
                    setGS(update);
                const id:number = window.setTimeout(()=>processTimeout(key), GS.repeatDelay);
                setTimeoutIds((timeoutIds) => {
                    timeoutIds.set(key, id);
                });
            }
        }
    }

    React.useEffect(() => {
        KH.setup(lookupAndExecute);
        return KH.teardown;
      //}, [GS.stream, GS.dict]);
    });

    // executed every tick
    const processInterval = () => {
        setGS((gs:GameState) => gs.pressedKeys.clear());
        save(GS);
    }

    if (doProcessInterval) {
        setDoProcessInterval(false);
        processInterval();
    }


    React.useEffect(() => {
        setGS(load());
        intervalId.current = window.setInterval(() => setDoProcessInterval(true),
        UIData.tick);
      return () => {
        window.clearInterval(intervalId.current);
      };
    }, []);
    
    const resetCallback = () => {
        setGS(GameData.initialGameState);
    }

    const speedupCallback = () => {
        setGS((gs:GameState) => {gs.repeatDelay = (gs.repeatDelay == GameData.fastRepeat) ? GameData.slowRepeat : GameData.fastRepeat;})
    }

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={GS.dict} lastTransform={GS.lastTransform || Types.emptyTransform} ></Dict>
            </div>
            <div className={styles.gameMiddle}>
                <StreamComponent stream={GS.stream} dict={GS.dict} />
                <Keyboard keyStatus={keyStatus} />
            </div>
            <div className={styles.gameFooter}>
                <Footer items={[
                    <Log key={0} log={GS.log} />,
                    <button key={1} className={styles.reset} onClick={resetCallback}>Reset</button>,
                    <RCScout key={3} />,
                    <Debug key={4}
                           speedupCallback={speedupCallback}
                           glyphs={GS.glyphs}
                           repeatDelay={GS.repeatDelay}
                           last={GS.lastTransform ?
                            (GS.lastTransform.output ? GS.lastTransform.output : GS.lastTransform.input) :
                            ""} />
                            
                ]} />
      
            </div>
        </div>
    );
}

export default GameMain;