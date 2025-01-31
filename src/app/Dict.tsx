'use client'

import React from "react";
import styles from "./css/dict.module.css";

interface ScoreProps {
  score: number;
  glyphs: number;
  words: number;
  maxWordSize: number;
};

const Scores = ({ score, glyphs, words, maxWordSize }: ScoreProps) => {
  return (
    <div className={styles.scoreBoard}>
      <div>Score : {score}</div>
      <div>Glyphs : {glyphs}</div>
      <div>Words : {words}</div>
      <div>Max Word Size : {maxWordSize}</div>
    </div>
  );
};

interface DictProps {
};

const Dict = ({ }: DictProps) => {
  return (
    <div className={styles.dictArea}>
      <div>Dict Area </div>
    </div>
  );
};

interface DictScoreProps {
  score: number,
  glyphs: number,
  words: number,
  maxWordSize: number,
};

const DictScoreArea = ({ score, glyphs, words, maxWordSize }: DictScoreProps) => {
  return (
    <div className={styles.dictScoreArea}>
      <Dict />
      <Scores score={score} glyphs={glyphs} words={words} maxWordSize={maxWordSize} />
    </div>
  )
};

export {Dict, DictScoreArea, Scores};
