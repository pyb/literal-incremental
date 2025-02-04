'use client'

import React from "react";
import { HStack, StackSeparator, Kbd, Theme, VStack } from "@chakra-ui/react";
import styles from "./css/keyboard.module.css";
import { UIData, GameData } from "./GameData";
/*
import { keyframes } from "motion";
*/

export interface KeyStatus {
  key: string,
  mode: KeyMode
}

export enum KeyMode {
  BOUGHT,
  PURCHASEABLE,
  REPEAT_PURCHASEABLE,
  VISIBLE,
  REPEAT_TOGGLE,
  FUNCTION_VISIBLE,
  FUNCTION_TOGGLED
}

interface KeyProps {
  text: string;
  highlight: boolean;
  mode: KeyMode;
  onclick: () => void;
}

const Key = ({ text, highlight, mode, onclick }: KeyProps) => {
  let palette:string = "";
  let variant:any = undefined;

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
    case KeyMode.FUNCTION_VISIBLE:
      palette = 'blue';
      variant = 'subtle';
      break;
    case KeyMode.FUNCTION_TOGGLED:
      palette = 'blue';
      variant = "outline";
      break;
    default:
  };

  if (!variant)
    variant = highlight? "subtle" : "raised";

  return (
    <div className="dark">
      <div className={styles.kbd}>
        <Kbd size='lg'
          variant={variant}
          className={styles.Kbd}
          onClick={onclick}
          colorPalette={palette}>
          <div className={styles.KbdKey}>
            {text}
          </div>
        </Kbd>
      </div>
    </div>
  )
}

const computeRows = (len:number, mx:number):Array<number> => {
  // Divide in rows.
  const rows = Math.ceil(len / mx);
  const basecols = Math.floor(len / rows);
  const rem = len % rows;

  let rowSizes = new Array(rows);
  for (let i = 0 ; i < rows ; i++)
  {
    if (i < rem) 
      rowSizes[i] = basecols + 1;
    else
      rowSizes[i] = basecols;
  }
  return rowSizes;
}

interface Props {
  keyStatus: KeyStatus[], // what Keys are available, and their status
  functionKeyStatus: KeyStatus[], // what modifier Keys are available, and their status
  lastPressedKey: string, // last pressed key?
  pressedKeys: Set<string>, // currently pressed keys
  fkeyCallback: (key: string) => void,
  clickCallback: (key: string) => void,
}

const Keyboard = ({keyStatus, functionKeyStatus, lastPressedKey, clickCallback, fkeyCallback, pressedKeys}: Props) => {
  const [keyHighlight, setKeyHighlight] = React.useState<boolean>(false);
  const highlightDuration = Math.max(UIData.highlightDuration, UIData.tick/1.5);

  const triggerKeyHighlight = () => {
    if (!keyHighlight)
    {
      setKeyHighlight(true);
      window.setTimeout(
        () => setKeyHighlight(false),
        highlightDuration);
    }
  }

  React.useEffect(()=>{
    if (pressedKeys.has(lastPressedKey)){
      triggerKeyHighlight();
    }
  },[pressedKeys, lastPressedKey, keyHighlight]);

  let allKeys = keyStatus.map(
    (keyStatus: KeyStatus) =>
      <Key text={keyStatus.key}
        key={keyStatus.key}
        highlight={keyHighlight && (keyStatus.key == lastPressedKey)}
        onclick={() => clickCallback(keyStatus.key)}
        mode={keyStatus.mode} />);

  const rowSizes:Array<number> = computeRows(keyStatus.length, UIData.maxKeyboardRowSize);
  
  let layeredKeys = new Array<Array<React.ReactNode>>();
  for (let size of rowSizes)
  {
    layeredKeys.push(allKeys.splice(0, size));
  }

  return (
    <div className={styles.keyboard}>
      <div className={styles.keyboardTop}>
        <VStack className={styles.vstack} separator={<StackSeparator className={styles.separator} />}>
          {layeredKeys.map((keyRow: Array<React.ReactNode>, index: number) =>
            <HStack className={styles.hstack} key={index} separator={<StackSeparator className={styles.separator} />}>
              {keyRow}
            </HStack>)}
        </VStack>
      </div>
      <div className={styles.keyboardBottom}>
        <HStack className={styles.vstack} separator={<StackSeparator className={styles.separator} />}>
          {functionKeyStatus.map((keyStatus: KeyStatus) =>
            <Key text={keyStatus.key}
              key={keyStatus.key} // for React
              highlight={false}
              onclick={() => fkeyCallback(keyStatus.key)}
              mode={keyStatus.mode} />)}
        </HStack>
      </div>

      </div>
  );
}

export default Keyboard;

//    <Theme appearance="dark">