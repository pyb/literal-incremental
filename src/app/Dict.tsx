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
      <div>Score</div>
      <div className={styles.score}>{score}</div>
      <div>Glyphs</div>
      <div className={styles.glyphs}>{glyphs}</div>
      <div>Max Word Size</div>
      <div className={styles.mws}>{maxWordSize}</div>
    </div>
  );
};

export interface DictItem {
  word: string,
  shortDesc?: string,
  longDesc?: string,
  score?: number,
};

interface DictProps {
  longItems: Array<DictItem>,
  shortItems: Array<DictItem>,
};

const Dict = ({ }: DictProps) => {
  return (
    <div className={styles.dictArea}>
    </div>
  );
};

interface DictScoreProps {
  score: number,
  glyphs: number,
  words: number,
  maxWordSize: number,
  longItems: Array<DictItem>,
  shortItems: Array<DictItem>,
};

export const DictScoreArea = ({ score, glyphs, words, maxWordSize, longItems, shortItems }: DictScoreProps) => {
  return (
    <div className={styles.dictScoreArea}>
      <Dict longItems={longItems} shortItems={shortItems}/>
      <Scores score={score} glyphs={glyphs} words={words} maxWordSize={maxWordSize} />
    </div>
  )
};
