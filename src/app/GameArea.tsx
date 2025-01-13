'use client'

import styles from "./page.module.css"
import React, { useEffect } from "react";

const GameArea = () => {
  const [word, setWord] = React.useState<string>("")
  const [score, setScore] = React.useState<number>(0);
  const wordLength = React.useRef<number>(0);
  const [text, setText] = React.useState<string>("");
  const [isBooster1Visible, setB1Visible] = React.useState<boolean>(false);
  const [isB1Active, setB1Active] = React.useState<boolean>(false);
  const multiplier = React.useRef<number>(1);

  const Booster1Threshold = 100;
  const Booster1Cost = 100;
  const Booster1Multiplier = 2;

  const dictionary = new Set<string>(['i', 'say']);

  const checkPartialWord = (partialWord: string, dictionary: Set<string>) => {
    for (let word of dictionary)
    {
      const len = partialWord.length;
      const w = word.slice(0, len);
      if (partialWord == w)
        return true;
    }
    return false;
  }
  useEffect(() => {
    const handlePress = (e: any) => {
      console.log(word)

      if (e.key.length == 1 && e.key >= 'a' && e.key <='z') {
        const newWord = word + e.key
        if (dictionary.has(newWord)) {
          setScore(score + 1)
          setWord("")
        }
        else if (checkPartialWord(newWord, dictionary)) {
          setWord(newWord)
        } else {
          setWord("")
        }
      }
    };
    window.addEventListener('keydown', handlePress);

    return () => {
      window.removeEventListener('keydown', handlePress);
    };
  }, [word, score]);

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
  const updateScore = (e: any) => {
      if (
          (e.code == "Enter") ||
          (e.code == "Space")
         )
      {
        const newscore = score + wordLength.current * multiplier.current;
        console.log()
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
      </ul>
      {/* <textarea 
        className={styles.gamearea} 
        value={text} 
        onChange={updateText} 
        onKeyDown={updateScore}
      >
      </textarea> */}
      <input autoFocus type="hidden"></input>
      <div>{word}</div>
    </div>
  )
}

export default GameArea;