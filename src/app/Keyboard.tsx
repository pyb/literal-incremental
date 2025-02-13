import styles from "./css/keyboard.module.css"
import * as Types from "./GameTypes"

interface Props {
    keyStatus: Map<string, Types.KeyStatus>
};

const Keyboard = ({keyStatus}:Props) => {
    let unlockedKeys = new Array<string>();
    let availableKeys = new Array<string>();

    for (const [key, status] of keyStatus) {
        if (status.modes.has(Types.KeyMode.Unlocked))
            unlockedKeys.push(key);
        if (status.modes.has(Types.KeyMode.Available))
            availableKeys.push(key);
    }

    return (
        <div className={styles.keyboardComponent}>
            <div>{availableKeys.map((key: string) =>
                <span className={styles.key} key={key}>{key}</span>
            )}</div>
            <div>{unlockedKeys.map((key: string) =>
                <span className={styles.key} key={key}>{key}</span>
            )}</div>
        </div>
    );
}

export default Keyboard;
