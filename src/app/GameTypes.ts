// letter or word is null/empty
export type InputItem = {
    letter?: string,
    word?: string,
    prefix?: string, // only the current input item can be a prefix.
    //key?: number,
    order?: number,
    n: number,
};

export interface LogItem {
    key: number,
    text: string
};

export interface DictItem {
    n?: number,
    visibility?: number,
    letter?: string,
    word?: string,
    shortDesc?: string,
    longDesc?: string,
    output?: string
  };

export enum KeyMode {
    INVISIBLE,
    UNLOCKED,
    VISIBLE, // but not yet purchaseable
    PURCHASEABLE,
    REPEAT_PURCHASEABLE,
    REPEAT_TOGGLE,
    FUNCTION_VISIBLE,
    FUNCTION_TOGGLED
}
