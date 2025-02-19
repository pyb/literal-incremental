export const sreverse = (s:string):string => {
    return s.split("").reverse().join("");
}

export const allAnagrams = (word:string):Set<string> => {
    const result = new Set<string>();
    if (word.length == 1) {
        result.add(word);
    }
    else {
        const len = word.length - 1;
        const letter = word[0];
        const anas:Set<string> = allAnagrams(word.slice(1));
        anas.forEach((ana:string) => {
            for (let i = 0 ; i <= len ; i++)
            {
                result.add(ana.slice(0,i) + letter + ana.slice(i));
            }
        });
        
    }
    return result;
}