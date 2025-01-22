'use client'

import React, { useEffect } from "react";
import styles from "./page.module.css"

type ShopItem = {
    text: string;
    position: number,
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

const Shop = ({ score, shopItems }: { score: number, shopItems: Array<ShopItem> }) => {
    const sortedShopItems = shopItems.sort((item1: ShopItem, item2: ShopItem) =>
                                             item1.position - item2.position);
    return (
        <>
            <ul className={styles.shop}>
                {sortedShopItems.map(
                    (shopItem: ShopItem) =>
                        (score >= shopItem.visCost) &&
                        <li key={shopItem.text} >
                            <ShopButton label={shopItem.text} callback={shopItem.callback} isActive={shopItem.active}></ShopButton>
                        </li>)}
            </ul >
        </>
    );
}

export {type ShopItem, Shop}
