'use client'

import React, { useEffect } from "react";
import styles from "./page.module.css"

type ShopItem = {
    text: string;
    visCost: number,
    active: boolean,
    callback: () => void
  };

const ShopButton = ({ label, isActive, callback }: { label: string, isActive: boolean, callback: () => void }) => {
    return (
        <button
            className={styles.shopButtonTest}
            onClick={callback}>
            <span className={isActive ? styles.boosterActive : styles.boosterInactive}>{label}</span>
        </button>)
}

const Shop = ({ glyphs, shopItems }: { glyphs: number, shopItems: Array<ShopItem> }) => {
    return (
        <>
            <ul className={styles.shop}>
                {shopItems.map(
                    (shopItem: ShopItem) =>
                        (glyphs >= shopItem.visCost) &&
                        <li key={shopItem.text} >
                            <ShopButton label={shopItem.text} callback={shopItem.callback} isActive={shopItem.active}></ShopButton>
                        </li>)}
            </ul >
        </>
    );
}

export {type ShopItem, Shop}
