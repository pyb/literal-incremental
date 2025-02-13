import styles from "./css/keyboard.module.css"
import {KeyStatus, KeyMode} from "./GameTypes"
import { HStack, StackSeparator, Kbd, Theme, VStack } from "@chakra-ui/react";

interface KeyProps {
    text: string,
    modes: Set<KeyMode>
};

const Key = ({text, modes}:KeyProps) => {
    return (
    <div className={styles.key}><Kbd size='lg' colorPalette="orange"> {text} </Kbd></div>
);}

interface KeyboardProps {
    keyStatus: Map<string, KeyStatus>
};

const Keyboard = ({keyStatus}:KeyboardProps) => {
    let unlockedKeys = new Array<string>();
    let availableKeys = new Array<string>();

    for (const [key, status] of keyStatus) {
        if (status.modes.has(KeyMode.Unlocked))
            unlockedKeys.push(key);
        if (status.modes.has(KeyMode.Available))
            availableKeys.push(key);
    }

    return (
        <div className="dark">
            <div className={styles.keyboardComponent}>
                <div className={styles.keyRow}>
                    <>
                    {unlockedKeys.map((key: string) =>
                        <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />)}
                    {availableKeys.map((key: string) =>
                        <Key text={key} key={key} modes={keyStatus.get(key)?.modes as Set<KeyMode>} />)}
                    </>
                </div>
            </div>
        </div>
    );
}

// <span className={styles.key} key={key}>{key}</span>
export default Keyboard;
