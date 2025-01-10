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
  
  useEffect(() => {
    const keyDownHandler = (e) => {
      //console.log(e.code)
      if (
          (e.code == "Enter") ||
          (e.code == "Space")
         )
      {
        console.log("Enter or space pressed!");
        setScore(wordLength.current);
        setText("");
      }
      else 
      {
        //console.log("something else")
        // console.log(`You pressed ${e.code}.`);
      }
    }
       
    document.addEventListener("keydown", keyDownHandler);

    // clean up
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);
  
  return (
    <div>
      <h1>Literal Incremental</h1>
      <span>score: {score}</span>
      <textarea className={styles.gamearea} value={text} onChange={updateText}></textarea>
    </div>
  )
}

export default GameArea;