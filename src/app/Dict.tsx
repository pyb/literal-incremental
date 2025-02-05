'use client'

import React from "react";
import styles from "./css/dict.module.css";
import { UIData } from "./GameData";
import { DictItem } from "./GameTypes";

const wordOrLetter = (item:DictItem) => {
  return ((item.word && item.word.length > 1) ? item.word : (<span className={styles.letter}>{item.word}</span>));
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
  items: Array<DictItem>,
};

const Dict = ({ items }: DictProps) => {
  const longItems:Array<DictItem> = items.slice(0,UIData.dictLongForm);
  const shortItems:Array<DictItem> = items.slice(UIData.dictLongForm);

  const maxShortItems = UIData.dictColumns * UIData.dictRows;

  return (
    <div className={styles.dictArea}>
      <div className={styles.longArea}>
        {longItems.map((item: DictItem, index:number) => <LongItem key={index} item={item} />)}
      </div>
      <div className={styles.shortArea}>
        {shortItems.slice(0, maxShortItems).map((item: DictItem) => <ShortItem key={item.word} item={item} />)}
      </div>
    </div>
  );
};

interface DictScoreProps {
  maxWordSize: number,
  items: Array<DictItem>,
};

const DictArea = ({ maxWordSize,  items }: DictScoreProps) => {
  return (
    <div className={styles.dictScoreArea}>
      <Dict items={items}/>
{/*      <Scores score={score} glyphs={glyphs} words={words} maxWordSize={maxWordSize} /> */}
    </div>
  )
};

export default DictArea;
