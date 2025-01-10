'use client'

import styles from "./page.module.css"
import React, { useEffect } from "react";

const GameArea = () => {
  const [score, setScore] = React.useState<number>(0);
  const wordLength = React.useRef<number>(0);
  const [text, setText] = React.useState<string>("");
  const [isBooster1Visible, setB1Visible] = React.useState<boolean>(false);
  const [isB1Active, setB1Active] = React.useState<boolean>(false);
  const multiplier = React.useRef<number>(1);

  const Booster1Threshold = 100;
  const Booster1Cost = 100;
  const Booster1Multiplier = 2;

  const updateText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // textdata logic
    const val = event.target.value;
    setText(val);
    const len = val.length;
    wordLength.current = len;
  }

  const activateBooster = () => {
    if (score >= Booster1Cost && !isB1Active) {
      setB1Active(true);
      setScore(score - Booster1Cost);
      multiplier.current *= Booster1Multiplier;
    }
  }
  
  const updateBoosterVisibility = (score: number) =>
  {
    if (score >= Booster1Threshold )
    {
      setB1Visible(true);
    }
  }
  const updateScore = (e) => {
      if (
          (e.code == "Enter") ||
          (e.code == "Space")
         )
      {
        const newscore = score + wordLength.current * multiplier.current;
        setScore(newscore);
        setText("");
        updateBoosterVisibility(newscore);
      }
  }
  
  return (
    <div>
      <h1>Literal Incremental</h1>
      <span>score: {score}</span>
      <ul>
        {
        isBooster1Visible &&
      <li>
        <button 
          className={isB1Active ? styles.boosterActive : styles.boosterInactive}
          onClick={activateBooster}
          id="booster1">
            Booster1
        </button>  
      </li>
      }
      {/* <li>
        <button id="booster2">Booster2</button>
      </li>
      <li>
        <button id="booster3">Booster3</button>
      </li>
      <li>
        <button id="booster4">Booster4</button>
      </li> */}
      </ul>
      <textarea 
        className={styles.gamearea} 
        value={text} 
        onChange={updateText} 
        onKeyDown={updateScore}
      >
      </textarea>
    </div>
  )
}

export default GameArea;