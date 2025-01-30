'use client'

import React from "react";
import { HStack, StackSeparator, Kbd, Theme } from "@chakra-ui/react";
import styles from "./keyboard.module.css";
import { UIData } from "./GameData";
/*
import { keyframes } from "motion";
*/

export interface KeyStatus {
  letter: string,
  mode: KeyMode
}

export enum KeyMode {
  BOUGHT,
  PURCHASEABLE,
  REPEAT_PURCHASEABLE,
  VISIBLE,
  REPEAT_TOGGLE
}

interface KeyProps {
  letter: string;
  highlight: boolean;
  mode: KeyMode;
  onclick: () => void;
}

const Key = ({ letter, highlight, mode, onclick }: KeyProps) => {
  let palette:string = "";

  switch(mode)
  {
    case KeyMode.BOUGHT:
      if (highlight)
        palette = 'yellow';
      else
        palette = 'orange';
      break;
    case KeyMode.PURCHASEABLE:
      palette = 'red';
      break;
    case KeyMode.REPEAT_PURCHASEABLE:
      palette = 'purple';
      break;
    case KeyMode.VISIBLE:
      palette = 'gray';
      break;
    case KeyMode.REPEAT_TOGGLE:
      palette = 'green';
      break;
    default:
  };

  return (
    <div className={styles.kbd}>
    <Kbd size='lg'
         variant={highlight ? 'subtle' : 'raised'}
         className={styles.Kbd}
         onClick={onclick}
         colorPalette={palette}>
      <div className={styles.KbdKey}>
        {letter}
        </div>
    </Kbd>
    </div>
  )
}

interface Props {
  allKeyStatus: KeyStatus[];
  focusedKey: string;
  repeatModeCallback: () => void;
  clickCallback: (key: string) => void;
  repeatVisible: boolean;
  pressedKeys: Set<string>;
}

const Keyboard = ({allKeyStatus, focusedKey, clickCallback, repeatModeCallback, repeatVisible, pressedKeys}: Props) => {
  const [keyHighlight, setKeyHighlight] = React.useState<boolean>(false);

  const triggerKeyHighlight = () => {
    if (!keyHighlight)
    {
      setKeyHighlight(true);
      window.setTimeout(
        () => setKeyHighlight(false),
        UIData.highlightDuration);
    }
  }

  React.useEffect(()=>{
    if (pressedKeys.has(focusedKey)){
      triggerKeyHighlight();
    }
  },[pressedKeys, focusedKey, keyHighlight]);

  return (
    <Theme appearance="dark">
      <HStack className={styles.stack} separator={<StackSeparator />}>
        {repeatVisible &&
          <div className={styles.kbd}>
            <Kbd size='lg'
              variant='subtle'
              className={styles.Kbd}
              onClick={repeatModeCallback}
              colorPalette='blue'>
              <div className={styles.KbdKey}>
                rpt
              </div>
            </Kbd>
          </div>}
        {allKeyStatus.map((keyStatus: KeyStatus) =>
          <Key key={keyStatus.letter}
            highlight={keyHighlight && (keyStatus.letter == focusedKey)}
            letter={keyStatus.letter}
            onclick={() => clickCallback(keyStatus.letter)}
            mode={keyStatus.mode} />)}
      </HStack>
    </Theme>
  )
}

export default Keyboard;