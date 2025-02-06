import React from "react"
import styles from "./css/game.module.css"
import Dict from "./Dict"
import Keyboard from "./Keyboard"
import Input from "./Input"

const Footer = () => {
    return (
        <>Footer</>
    );
}

const Game = () => {
    return (
        <>
            <div className={styles.game}>
                <div className={styles.gameTop}>
                    <Dict></Dict>
                </div>
                <div className={styles.gameCenter}>
                    <Input></Input>
                    <Keyboard></Keyboard>
                </div>
                <div className={styles.gameFooter}>
                    <Footer></Footer>
                </div>
            </div>
        </>
    )
}

export default Game;