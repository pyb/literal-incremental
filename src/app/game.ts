import {KeyStatus, KeyMode} from "./GameTypes"
import * as Stream from "./streamops"
import {GameState, UIState} from "./GameState"
import GameData from "./GameData"
import * as Types from "./GameTypes"
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

// TODO : replace this with just null
const dummyGS = (gs:GameState) => {

}

export const execute = (key: string, keyStatus: Map<string, KeyStatus>, stream: Array<Letter>, dict:Array<Types.Transform>):((gs:GameState) => void) => {
  const status = keyStatus.get(key);
  if (!status)
    //throw new Error('Error: unknown key : ' + key);
  {
    console.log('Error: unknown key : ' + key);
    return dummyGS;
  }
  const modes:Set<KeyMode> = status.modes;
  // TODO : what to do if TRANSFORM and UNLOCKED?
  if (modes.has(KeyMode.LetterTranform) && modes.has(KeyMode.Available))
    return letterTransform(key, stream, dict);
  else if (modes.has(KeyMode.WordTransformKey) && modes.has(KeyMode.Available))
    return wordTransform(stream, dict);
  else if (modes.has(KeyMode.Unlocked) && modes.has(KeyMode.Letter))
    return directInput(key);
  else if ( modes.has(KeyMode.Modifier) &&
           ((modes.has(KeyMode.Available) || modes.has(KeyMode.Unlocked))))
    return toggleModifier(key);
  else 
    console.log("Error: key not available"); // should this case be intercepted higher up in the stack
  return dummyGS;
}

const directInput = (key: string) => {
  return ((gs:GameState) => {
    gs.glyphs += 1;
    gs.stream = Stream.addLetter(key, gs.stream);
  });
}

const letterTransform = (key: string, stream:Array<Letter>, dict:Array<Types.Transform>) => {
  const transforms:Map<string, Types.TransformLocation> = Stream.scanForLetters(stream, dict);
  const transformLocation = transforms.get(key);
  if (!transformLocation)
    throw new Error('Bug: transform not found');
  const id:number = transformLocation.id;
  const transform = dict.find((item:Transform) => item.id == id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return ((gs:GameState) => {
    //gs.stream = Stream.addLetter(key, gs.stream);

    gs.stream = Stream.applyLetterTransform(transform, stream, transformLocation.location)
  });
}

const wordTransform = (stream:Array<Letter>, dict:Array<Types.Transform>) => {
  const transforms:Array<Types.TransformLocation> = Stream.scanForWords(stream, dict);
  const transformLocation = transforms[0];
  
  if (!transformLocation)
    throw new Error('Bug: transform not found');

  const transform = dict.find((item:Transform) => item.id == transformLocation.id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return ((gs:GameState) => {
    gs.stream = Stream.applyWordTransform(transform, stream, transformLocation.location)
  });
}

const toggleModifier = (key:string) => {
  return dummyGS;
}