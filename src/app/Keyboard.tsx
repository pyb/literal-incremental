'use client'

import React from "react";
import { HStack, StackSeparator, Kbd, Theme } from "@chakra-ui/react";
import styles from "./css/keyboard.module.css";
import { UIData } from "./GameData";
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
  )
}

interface Props {
  keyStatus: KeyStatus[],
  functionKeyStatus: KeyStatus[],
  focusedKey: string,
  pressedKeys: Set<string>,
  fkeyCallback: (key: string) => void,
  clickCallback: (key: string) => void,
}

const Keyboard = ({keyStatus, functionKeyStatus, focusedKey, clickCallback, fkeyCallback, pressedKeys}: Props) => {
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
      <HStack className={styles.stack} separator={<StackSeparator colorPalette="pink"/>}>
        {functionKeyStatus.map((keyStatus: KeyStatus) =>
          <Key text={keyStatus.key}
            highlight={false}
            onclick={() => fkeyCallback(keyStatus.key)}
            mode={keyStatus.mode} />)}
        {keyStatus.map((keyStatus: KeyStatus) =>
          <Key text={keyStatus.key}
            highlight={keyHighlight && (keyStatus.key == focusedKey)}
            onclick={() => clickCallback(keyStatus.key)}
            mode={keyStatus.mode} />)}
      </HStack>
    </Theme>
  );
}

export default Keyboard;
