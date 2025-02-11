import {KeyStatus, KeyMode} from "./GameTypes"
import * as Stream from "./streamops"
import * as GS from "./GameState"
import * as GD from "./GameData"
import * as GT from "./GameTypes"
import {Transform} from "./GameTypes"

// Todo: this should prob. get all the modifier key names as input? Or make this file dependent on UIData (bof)
export const getAvailableKeys = (input:Array<Letter>, dict: Array<Transform>, wordTransformKey:string):Array<string> => {
    const result:Array<string> = [];
    
    const letters = Stream.scanForLetters(input, dict);
    const words = Stream.scanForWords(input, dict);

    Array.from(letters.keys()).forEach((key) => result.push(key));
    if (words.length > 0)
        result.push(wordTransformKey);

    return result;
}

/*
  All keyboard driven?
  3 types of command. All keys are:
   * modifiers (none for now), 
   * direct input (unlocked Keys), or
   * dict transforms 
      - letter transforms, or
      - word transforms (enter key) 
*/

// functional programming : input is sub command (modifier ; direct input key ; letter transform or "Enter")
// output is changes to state
/*
  What changes?
  -> more "commands" I guess? or "effects"? "actions"?
  Actions :
  -Tranform (per ID)
  -Direct input
  -Toggle modifier
  -Increase glyphs score?
  -...?
*/

const execute = (key: string, keyStatus: Map<string, KeyStatus>) => {
  const status = keyStatus.get(key);
  if (!status)
    throw new Error('Error: unknown key');

  const modes:Set<KeyMode> = status.modes;
  // TODO : what to do if TRANSFORM and UNLOCKED?
  if (modes.has(KeyMode.LetterTranform) && modes.has(KeyMode.Available))
    return transform(key);
  else if (modes.has(KeyMode.Unlocked) && modes.has(KeyMode.Letter))
    return directInput(key);
  else if ( modes.has(KeyMode.Modifier) &&
           ((modes.has(KeyMode.Available) || modes.has(KeyMode.Unlocked))))
    return toggleModifier(key);
  else 
    console.log("Error: key not available"); // should this case be intercepted higher up in the stack
}

const directInput = (key: string) => {
  return ((gs:GS.GameState) => {
    gs.stream = Stream.addLetter(key, gs.stream);
  });
}

const transform = (key: string) => {

}

const toggleModifier = (key:string) => {

}