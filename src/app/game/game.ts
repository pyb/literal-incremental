import {KeyStatus, KeyMode, GameState, Transform, TransformLocation, Letter, Effect, EffectType, StateUpdate} from "game/gameTypes"
import * as Stream from "game/streamops"
import {specialKeys, keyVisibility} from "game/gameData"
import UIData from "UI/uiData"
import { tr } from "motion/react-client";

const createEmptyKeyStatus = (key:string):KeyStatus => ({
  key:key,
  modes: new Set<KeyMode>
});

// Compute key status?
export const computeKeyStatus = (visibleKeys:Set<string>, unlockedKeys: Array<string>, pressedKeys: Set<string>,
                                 stream: Array<Letter>, dict: Array<Transform>):
    Map<string, KeyStatus> => {
  const result = new Map<string, KeyStatus>([]);

  const letterTransforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const wordTransforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);
  
  const letterTransformKeys:Array<string> = Array.from(letterTransforms.keys());
      
  visibleKeys.forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));
  unlockedKeys.forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));

  wordTransforms.forEach((transformLocation: TransformLocation) => {
    const transform:Transform|undefined =  dict.find((t)=> t.id == transformLocation.id);
    const key = transform?.output;
    if (key && key.length == 1)
    {
      result.get(key)?.modes.add(KeyMode.WordTransform);
      result.get(key)?.modes.add(KeyMode.Available);
    }
  });

  visibleKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Visible);
    if (!specialKeys.has(key))
      result.get(key)?.modes.add(KeyMode.Letter);
  });

  unlockedKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Unlocked);
    result.get(key)?.modes.add(KeyMode.Available);
  });

  letterTransformKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.LetterTranform);
    result.get(key)?.modes.add(KeyMode.Available);
  });

  pressedKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Active);
  });

  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Visible);
  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.WordTransformKey);
  if (wordTransforms.length != 0)
    result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Available);

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

export const executeEffect = (effect:Effect, stream:Array<Letter>, dict:Array<Transform>):
((gs:GameState) => void) | null => {
  if (effect.type == EffectType.LetterUnlock) {
    const letter:string = effect.letter as string;
    return ((gs:GameState) => { gs.unlockedKeys.push(letter)});
  }
  return null;
}

export const executeTransform = (key: string, status: KeyStatus, stream: Array<Letter>, dict:Array<Transform>):
[effect: Effect | undefined, ((gs:GameState) => void) | undefined] => {
    
  const modes:Set<KeyMode> = status.modes;
//  console.log(modes)
  // TODO : what to do if TRANSFORM and UNLOCKED?
  if (modes.has(KeyMode.WordTransform) && modes.has(KeyMode.Available))
    return wordTransform(stream, dict);
  else if (modes.has(KeyMode.LetterTranform) && modes.has(KeyMode.Available))
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
  return [undefined, undefined];
}

export const execute = (key: string, keyStatus: Map<string, KeyStatus>, stream: Array<Letter>, dict:Array<Transform>):
    Array<StateUpdate> => {
  const status = keyStatus.get(key);
  if (!status)
  {
    //throw new Error('Error: unknown key : ' + key);
    console.log('Error: unknown key : ' + key);
    return [];
  }
  const [effect, transformResult] = executeTransform (key, status, stream, dict);
  if (transformResult)
  {
    const effectResult = effect ? executeEffect(effect, stream, dict) : null;
    if (effectResult)
      return [effectResult, transformResult];
    else
      return [transformResult];
  }
  return [];
}

const directInput = (key: string):[effect: Effect | undefined, ((gs:GameState) => void) | undefined]  => {
  return [undefined,
    ((gs:GameState) => {
      gs.glyphs += 1;
      keyVisibility.forEach((visibility:number, key:string) => { if (visibility <= gs.glyphs) gs.visibleKeys.add(key)});
      gs.stream = Stream.addLetter(key, gs.stream);
    })];
}

const letterTransform = (key: string, stream:Array<Letter>, dict:Array<Transform>): [effect: Effect | undefined, ((gs:GameState) => void) | undefined] => {
  const transforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const transformLocation = transforms.get(key);
  if (!transformLocation)
    throw new Error('Bug: transform not found');
  const id:number = transformLocation.id;
  const transform = dict.find((item:Transform) => item.id == id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return [transform.effect, 
    ((gs:GameState) => {
      //gs.stream = Stream.addLetter(key, gs.stream);
      gs.lastTransform = transform;
      gs.stream = Stream.applyLetterTransform(transform, stream, transformLocation.location)
    })];
}

const wordTransform = (stream:Array<Letter>, dict:Array<Transform>): [effect: Effect | undefined, ((gs:GameState) => void) | undefined] => {
  const transforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);
  const transformLocation = transforms[0];
  
  if (!transformLocation)
    throw new Error('Bug: transform not found');

  const transform = dict.find((item:Transform) => item.id == transformLocation.id);
  if (!transform)
    throw new Error('Bug: transform id not found');

  return [transform.effect,
    ((gs:GameState) => {
    gs.lastTransform = transform;
    gs.stream = Stream.applyWordTransform(transform, stream, transformLocation.location)
  })];
}

const toggleModifier = (key:string):any => {
  return [undefined, undefined];
}