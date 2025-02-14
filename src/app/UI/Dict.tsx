import styles from "css/dict.module.css"
import * as Types from "game/gameTypes"

interface Props {
    dict: Array<Types.Transform>,
    lastTransform: Types.Transform,
};

const Dict = ({dict, lastTransform}: Props) => {
    return (
        <div className={styles.dictComponent}><span>Last: </span><br></br><span>{lastTransform && lastTransform.input}</span></div>
    )
}

export default Dict;
