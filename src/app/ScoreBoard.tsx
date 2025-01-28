
'use client'

import React from "react";
import styles from "./score.module.css";

const ScoreBoard = ({ score, glyphs, words, maxWordSize }: { score: number, glyphs: number, words: number, maxWordSize: number}) => {
  return (
    <div className={styles.scoreBoard}>
      <div>Score : {score}</div>
      <div>Glyphs : {glyphs}</div>
      <div>Words : {words}</div>
      <div>Max Word Size : {maxWordSize}</div>
    </div>
  );
};

export default ScoreBoard;