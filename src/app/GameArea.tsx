'use client'

import styles from "./page.module.css"
import React, { useEffect } from "react";

const GameArea = () => {
  const [score, setScore] = React.useState<number>(0);
  const wordLength = React.useRef<number>(0);
  const [text, setText] = React.useState<string>("");
  const updateText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // textdata logic
    const val = event.target.value;
    setText(val);
    const len = val.length;
    wordLength.current = len;
  }
  
  const updateScore = (e) => {
      if (
          (e.code == "Enter") ||
          (e.code == "Space")
         )
      {
        setScore(wordLength.current);
        setText("");
      }
  }
  
  return (
    <div>
      <h1>Literal Incremental</h1>
      <span>score: {score}</span>
      <textarea 
        className={styles.gamearea} 
        value={text} 
        onChange={updateText} 
        // onKeyDown={updateScore}
      >
      </textarea>
    </div>
  )
}

export default GameArea;