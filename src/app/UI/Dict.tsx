import styles from "css/dict.module.css"
import {Transform} from "game/gameTypes"
import UIData from "UI/uiData"


const wordOrLetter = (item: Transform) => {
    return ((item.input && item.input.length > 1) ? item.input : (<span className={styles.letter}>{item.input}</span>));
}

const LongItem = ({ item, unlocked }: { item: Transform, unlocked: boolean }) => {
    const content = item.longDesc ? item.longDesc : item.output;
    const contentStyle = item.longDesc ? styles.LIdesc : styles.itemScore;

    return (
        <div className={unlocked ? styles.unlocked : styles.locked}>
            <span> {/* todo : use divs instead to control the vertical alignment */}
                {item.n && <span className={styles.qty}>{item.n}</span>}
                <span className={styles.LIword}>{wordOrLetter(item)}</span>
            </span>
            <span>{"-> "}</span>
            <span className={contentStyle}>{content}</span>
        </div>
    )
};

const ShortItem = ({ item, unlocked }: { item: Transform, unlocked: boolean}) => {
    const content = item.shortDesc ? item.shortDesc : item.output;
    const contentStyle = item.shortDesc ? styles.SIdesc : styles.itemScore;

    return (
        <div className={unlocked ? styles.unlocked : styles.locked}>

            <div className={styles.shortItem}>
                {item.n && <span className={styles.qty}>{item.n}</span>}
                <span className={styles.SIword}>{wordOrLetter(item)}</span>
                <span>{"-> "}</span>
                <span className={contentStyle}>{content}</span>
                {item.longDesc && <span className={styles.tooltiptext}>{item.longDesc}</span>}
            </div>
        </div>
    )
};

interface Props {
    dict: Array<Transform>,
    unlockedDict: Set<number>,
    lastTransform: Transform,
};

const Dict = ({ dict, unlockedDict, lastTransform }: Props) => {
    const longItems: Array<Transform> = dict.slice(0, UIData.dictLongForm);
    const shortItems: Array<Transform> = dict.slice(UIData.dictLongForm);

    const maxShortItems = UIData.dictColumns * UIData.dictRows;

    return (
        <div className={styles.dictComponent}>
            {dict.length > 0 &&
                <>
                    <div className={styles.longArea}>
                        <div className={styles.longAreaMain}>
                            {longItems.map((item: Transform, index: number) => <LongItem key={index} item={item} unlocked={unlockedDict.has(item.id)} />)}
                        </div>
                        <div className={styles.lastTransform}>
                            {lastTransform.input && <ShortItem item={lastTransform} unlocked={unlockedDict.has(lastTransform.id)} />}
                        </div>
                    </div>
                    <div className={styles.shortArea}>
                        {shortItems.slice(0, maxShortItems).map((item: Transform) => <ShortItem key={item.input} item={item} unlocked={unlockedDict.has(item.id)} />)}
                    </div>
                </>}
        </div>
    );
};

export default Dict;
