// letter or word is null/empty
export type InputItem = {
    letter?: string,
    word?: string,
    prefix?: string,
    //key?: number,
    order?: number
};

export interface LogItem {
    key: number,
    text: string
}

export interface DictItem {
    n?: number,
    word: string,
    shortDesc?: string,
    longDesc?: string,
    output?: string
  };
  