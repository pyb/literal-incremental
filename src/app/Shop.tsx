'use client'

import React, { useEffect } from "react";

import styles from "./shop.module.css"
import {ShopAction, ShopEntry} from "./GameData"
/*
import { s } from "motion/react-client";
*/

interface ButtonProps {
    label: string;
    price: number;
    isActive: boolean;
    callback: () => void;
}

const ShopButton = ({ label, price, isActive, callback }: ButtonProps) => {
    return (
        <div>
            <div className={isActive ? styles.shopButtonActive : styles.shopButtonInactive}>
            <button className={styles.botonElegante}
                    onClick={callback}>
                <p>{label}</p>
                <p className={styles.shopPrice}>{price}</p>
            </button>
        </div></div>);
}

interface Props {
    score: number;
    shopItems: Array<ShopEntry>;
    visibleShopItems: Set<number>;
    activeShopItems: Set<number>;
    callback: (action: ShopAction, n: number, index: number, shopEntries: Array<ShopEntry>) => void;
};

const Shop = ({ score, callback, shopItems, visibleShopItems, activeShopItems }: Props) => {
    const sortedShopItems = shopItems.toSorted((item1: ShopEntry, item2: ShopEntry) =>
                                                item1.position - item2.position);
    return (
        <>
            <ul className={styles.shop}>
                {sortedShopItems.map(
                    (shopItem: ShopEntry) =>
                        (visibleShopItems.has(shopItem.index)) &&
                        <li key={shopItem.text} >
                            <ShopButton label={shopItem.text}
                                        price={shopItem.price}
                                        callback={() => callback(shopItem.action, shopItem.n, shopItem.index, shopItems)}
                                        isActive={activeShopItems.has(shopItem.index)}></ShopButton>
                        </li>)}
            </ul >
        </>
    );
}

export default Shop;
