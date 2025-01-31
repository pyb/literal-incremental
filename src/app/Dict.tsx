'use client'

import React from "react";
import styles from "./css/dict.module.css";
import { UIData } from "./GameData";

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

const LongItem = ({item}: {item: DictItem}) => {
  const content = item.longDesc ? item.longDesc : item.score;
  const contentStyle = item.longDesc? styles.LIdesc : styles.itemScore;

  return (
  <div className={styles.longItem}>
    <span className={styles.LIword}>{item.word}</span><span className={contentStyle}>{content}</span>
  </div>
)};

const ShortItem = ({item}: {item: DictItem}) => {
  const content = item.shortDesc ? item.shortDesc : item.score;
  const contentStyle = item.shortDesc? styles.SIdesc : styles.itemScore;

  return (
  <div className={styles.shortItem}>
    <span className={styles.SIword}>{item.word}</span><span className={contentStyle}>{content}</span>
    {item.longDesc && <span className={styles.tooltiptext}>{item.longDesc}</span>}
  </div>
)};

interface DictProps {
  longItems: Array<DictItem>,
  shortItems: Array<DictItem>,
};

const Dict = ({ longItems, shortItems }: DictProps) => {
  const maxShortItems = UIData.dictColumns * UIData.dictRows;

  return (
    <div className={styles.dictArea}>
      <div className={styles.longArea}>
        {longItems.map((item: DictItem) => <LongItem key={item.word} item={item} />)}
      </div>
      <div className={styles.shortArea}>
        {shortItems.slice(0, maxShortItems).map((item: DictItem) => <ShortItem key={item.word} item={item} />)}
      </div>
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
