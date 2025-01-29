
'use client'

import React from "react";
import styles from "./score.module.css";

interface Props {
  score: number;
  glyphs: number;
  words: number;
  maxWordSize: number;
};

const ScoreBoard = ({ score, glyphs, words, maxWordSize }: Props) => {
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