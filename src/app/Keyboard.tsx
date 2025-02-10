import styles from "./css/keyboard.module.css"

interface Props {
    availableKeys: Array<string>,
    unlockedKeys: Array<string>,
};

const Keyboard = ({availableKeys, unlockedKeys}:Props) => {
    return (
        <div className={styles.keyboardComponent}>
            <div>{availableKeys.map((key: string) =>
                <span className={styles.key} key={key}>{key}</span>
            )}</div>
            <div>{unlockedKeys.map((key: string) =>
                <span className={styles.key} key={key}>{key}</span>
            )}</div>
        </div>
    )
}

export default Keyboard;
