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
import {KeyStatus, GameState, GameStateUpdate, Transform} from "game/gameTypes"
import * as Game from "game/game"
import * as KH from "game/keyboardHandling"
import RCScout from "UI/RCScout";
import Log from "UI/Log"
import UIData from "UI/uiData";
import { load, save } from "game/persist";

interface DebugProps {
    glyphs: number,
    last: string,
    speedupCallback: () => void,
    repeatMultiplier: number,
}

const Debug = ({ glyphs, last, speedupCallback, repeatMultiplier }: DebugProps) => {
    return (
        <div className={styles.debug}>
            <div>{"Glyphs : " + glyphs.toString()}</div>
            <div>{"Last : " + last}</div>
            <button key={2} className={styles.reset} onClick={speedupCallback}>{(repeatMultiplier == GameData.fastRepeat)? " Slower" : "Faster"}</button>
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

let k:number = 0;

const GameMain = () => {
    const [GS, setGS] = useImmer<GameState>(GameData.initialGameState);
    const [doProcessInterval, setDoProcessInterval] = React.useState<boolean>(false);
    const intervalId = React.useRef<number>(0);
                                                         
    const keyStatus:Map<string, KeyStatus> = Game.computeKeyStatus(GS);
    const visibleDict: Array<Transform> = GS.dict.filter((transform:Transform)=> GS.visibleTransforms.has(transform.id));
    const unlockedDict = new Set<number>(Game.unlockedDict(GS.dict, GS.visibleTransforms, GS.unlockedTransforms)
                                        .map((transform:Transform)=> transform.id));
    if (GS.keysToTrigger.size > 0)
    {
        const activeKeys = new Set<string>();
        GS.keysToTrigger.forEach((key: string) => {
            const updates: Array<GameStateUpdate> = Game.execute(key, keyStatus, GS);
            updates.forEach((update) => {
                if (update) {
                    activeKeys.add(key);
                    setGS(update);
                }
            });
        });
        setGS((gs: GameState) => {
            gs.keysToTrigger.clear();
            gs.activeKeys = activeKeys;
        });
    }
  
    // executed every tick
    const processTick = () => {
        save(GS);
        // The below will add keys to keysToTrigger
        const update:GameStateUpdate = KH.handleTick();
        if (update)
            setGS(update);
    }

    if (doProcessInterval) {
        setDoProcessInterval(false);
        processTick();
    }

    React.useEffect(() => {
        setGS(load());
        intervalId.current = window.setInterval(() => setDoProcessInterval(true),
            UIData.tick);
        KH.setup((key: string, pressed: boolean) => {
            const update: GameStateUpdate = KH.changeKeyPressStatus(key, pressed);
            if (update)
                setGS(update);
        });
        return () => {
            KH.teardown();
            window.clearInterval(intervalId.current);
        };
    }, [setGS]);

    const resetCallback = () => {
        setGS(GameData.initialGameState);
    }
    const speedupCallback = () => {
        setGS((gs:GameState) => {gs.repeatDelayMultiplier = (gs.repeatDelayMultiplier== 1) ? GameData.fastRepeat : 1});
    }

    return (
        <div className={styles.game}>
            <div className={styles.gameTop}>
                <Dict dict={visibleDict}
                      availableDict={Game.availableDict(GS)}
                      lastTransform={GS.lastTransform || Types.emptyTransform} ></Dict>
            </div>
            <div className={GS.glyphs > 1 ? styles.gameMiddleBorder : undefined}>
                <div className={styles.gameMiddle}>
                    {GS.glyphs > 1 &&
                        <StreamComponent stream={GS.stream} lastDestroyedWord={GS.destroyed}
                                         destroyedLocation={GS.destroyedLocation} destroyedWordId={GS.destroyedWordCounter}
                                         dict={GS.dict.filter((transform: Transform) => unlockedDict.has(transform.id))} />
                    }
                    <Keyboard large={GS.glyphs == 0} keyStatus={keyStatus} />
                </div>
            </div>
            <div className={styles.gameFooter}>
                <div className={GS.glyphs < 6 ? styles.hidden : undefined}>
                    <Footer items={[
                        <Log key={0} log={GS.log} />,
                        <RCScout key={3} />,
                        <Debug key={4}
                            speedupCallback={speedupCallback}
                            glyphs={GS.glyphs}
                            repeatMultiplier={GS.repeatDelayMultiplier}
                            last={GS.lastTransform ?
                                (GS.lastTransform.output ? GS.lastTransform.output
                                    : (GS.lastTransform.letter || GS.lastTransform.word) as string) :
                                ""} />,
                        <button key={1} className={styles.reset} onClick={resetCallback}>Reset</button>,
                    ]} />
                </div>
            </div>
        </div>
    );
}

export default GameMain;
