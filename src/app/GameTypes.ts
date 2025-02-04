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
    word: string,
    shortDesc?: string,
    longDesc?: string,
    output?: string
  };
  