import {KeyStatus, KeyMode, GameState} from "game/gameTypes"
import * as Stream from "game/streamops"
import {Transform, TransformLocation, Letter} from "game/gameTypes"
import * as Test from "test/testData"
import UIData from "UI/uiData"

// Todo: this should prob. get all the modifier key names as input? Or make this file dependent on UIData (bof)
/*
export const getAvailableKeys = (input:Array<Letter>, dict: Array<Transform>, wordTransformKey:string):Array<string> => {
    const result:Array<string> = [];
    
    const letters = Stream.scanForLetters(input, dict);
    const words = Stream.scanForWords(input, dict);

    Array.from(letters.keys()).forEach((key) => result.push(key));
    if (words.length > 0)
        result.push(wordTransformKey);

    return result;
}
*/
    //const availableKeys:Array<string> = Game.getAvailableKeys(GS.stream, GS.dict, UIData.wordTransformKey);


const createEmptyKeyStatus = (key:string):KeyStatus => ({
  key:key,
  modes: new Set<KeyMode>
});

// Compute key status?
export const computeKeyStatus = (visibleKeys:Array<string>, unlockedKeys: Array<string>, pressedKeys: Set<string>,
                                 stream: Array<Letter>, dict: Array<Transform>):
    Map<string, KeyStatus> => {
  const result = new Map<string, KeyStatus>([]);

  const letterTransforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const wordTransforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);
  
  const letterTransformKeys:Array<string> = Array.from(letterTransforms.keys());
  const availableKeys = new Set<string>(letterTransformKeys);
  if (wordTransforms.length != 0)
    availableKeys.add(UIData.wordTransformKey);
      
  const allKeys:Set<string> = availableKeys.union(new Set<string>(unlockedKeys)).union(new Set<string>(visibleKeys));

  allKeys.forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));

  // temp
  allKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Visible);
    if (!UIData.specialKeys.has(key))
      result.get(key)?.modes.add(KeyMode.Letter);
  });

  unlockedKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Unlocked);
  });

  letterTransformKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.LetterTranform);
  });

  availableKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Available);
  });

  pressedKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Active);
  });

  if (wordTransforms.length != 0)
    result.get(UIData.wordTransformKey)?.modes.add(KeyMode.WordTransformKey);

  return result;
}

/******************************** */
// commands

/*
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

export const execute = (key: string, keyStatus: Map<string, KeyStatus>, stream: Array<Letter>, dict:Array<Transform>):
    ((gs:GameState) => void) | null => {
  const status = keyStatus.get(key);
  if (!status)
    //throw new Error('Error: unknown key : ' + key);
  {
    console.log('Error: unknown key : ' + key);
    return null;
  }
  const modes:Set<KeyMode> = status.modes;
//  console.log(modes)
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
  return null;
}

const directInput = (key: string) => {
  return ((gs:GameState) => {
    gs.glyphs += 1;
    gs.stream = Stream.addLetter(key, gs.stream);
  });
}

const letterTransform = (key: string, stream:Array<Letter>, dict:Array<Transform>) => {
  const transforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const transformLocation = transforms.get(key);
  if (!transformLocation)
    throw new Error('Bug: transform not found');
  const id:number = transformLocation.id;
  const transform = dict.find((item:Transform) => item.id == id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return ((gs:GameState) => {
    //gs.stream = Stream.addLetter(key, gs.stream);
    gs.lastTransform = transform;
    gs.stream = Stream.applyLetterTransform(transform, stream, transformLocation.location)
  });
}

const wordTransform = (stream:Array<Letter>, dict:Array<Transform>) => {
  const transforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);
  const transformLocation = transforms[0];
  
  if (!transformLocation)
    throw new Error('Bug: transform not found');

  const transform = dict.find((item:Transform) => item.id == transformLocation.id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return ((gs:GameState) => {
    gs.lastTransform = transform;
    gs.stream = Stream.applyWordTransform(transform, stream, transformLocation.location)
  });
}

const toggleModifier = (key:string) => {
  return null;
}