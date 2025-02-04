'use client'

import React from "react";
import styles from "./css/dict.module.css";
import { UIData } from "./GameData";
import { DictItem } from "./GameTypes";

const wordOrLetter = (item:DictItem) => {
  return ((item.word.length > 1) ? item.word : (<span className={styles.letter}>{item.word}</span>));
}
const LongItem = ({item}: {item: DictItem}) => {
  const content = item.longDesc ? item.longDesc : item.output;
  const contentStyle = item.longDesc? styles.LIdesc : styles.itemScore;

  return (
  <div className={styles.longItem}>
    {item.n && <span className={styles.qty}>{item.n}</span>}
    <span className={styles.LIword}>{wordOrLetter(item)}</span>
    <span>{"-> "}</span>
    <span className={contentStyle}>{content}</span>
  </div>
)};

const ShortItem = ({item}: {item: DictItem}) => {
  const content = item.shortDesc ? item.shortDesc : item.output;
  const contentStyle = item.shortDesc? styles.SIdesc : styles.itemScore;

  return (
  <div className={styles.shortItem}>
    {item.n && <span className={styles.qty}>{item.n}</span>}
    <span className={styles.SIword}>{wordOrLetter(item)}</span>
    <span>{"-> "}</span>
    <span className={contentStyle}>{content}</span>
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
  maxWordSize: number,
  longItems: Array<DictItem>,
  shortItems: Array<DictItem>,
};

const DictArea = ({ maxWordSize, longItems, shortItems }: DictScoreProps) => {
  return (
    <div className={styles.dictScoreArea}>
      <Dict longItems={longItems} shortItems={shortItems}/>
{/*      <Scores score={score} glyphs={glyphs} words={words} maxWordSize={maxWordSize} /> */}
    </div>
  )
};

export default DictArea;
