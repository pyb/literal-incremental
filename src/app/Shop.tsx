'use client'

import React, { useEffect } from "react";
import styles from "./page.module.css"
import {ShopEntry} from "./gamedata"
import { s } from "motion/react-client";

/*
type ShopItem = {
    text: string;
    position: number,
    visCost: number,
    active: boolean,
    callback: () => void
  };
*/

const ShopButton = ({ label, price, isActive, callback }: { label: string, price: number, isActive: boolean, callback: () => void }) => {
    return (
        <button
            className={styles.shopButtonTest}
            onClick={callback}>
            <div className={isActive ? styles.shopButtonActive : styles.shopButtonInactive}>
                <div>{label}</div>
                <div>{price}</div>
            </div>
        </button>)
}

const Shop = ({ score, callback, shopItems, visibleShopItems, activeShopItems }:
     { score: number, shopItems: Array<ShopEntry>, visibleShopItems: Set<string>, activeShopItems: Set<string>, callback: (id: string, shopEntries: Array<ShopEntry>) => void }) => {
    const sortedShopItems = shopItems.toSorted((item1: ShopEntry, item2: ShopEntry) =>
                                                item1.position - item2.position);
    return (
        <>
            <ul className={styles.shop}>
                {sortedShopItems.map(
                    (shopItem: ShopEntry) =>
                        (visibleShopItems.has(shopItem.id)) &&
                        <li key={shopItem.text} >
                            <ShopButton label={shopItem.text}
                                        price={shopItem.price}
                                        callback={() => callback(shopItem.id, shopItems)}
                                        isActive={activeShopItems.has(shopItem.id)}></ShopButton>
                        </li>)}
            </ul >
        </>
    );
}
export default Shop;
