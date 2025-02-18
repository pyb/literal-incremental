import {KeyStatus, KeyMode, GameState, Transform, TransformLocation, Letter, Effect, EffectType, GameStateUpdate} from "game/gameTypes"
import * as Stream from "game/streamops"
import {specialKeys, keyVisibility, initialRepeatDelay} from "game/gameData"
import UIData from "UI/uiData"
import { tr } from "motion/react-client";

const createEmptyKeyStatus = (key:string):KeyStatus => ({
  key:key,
  modes: new Set<KeyMode>
});

// Compute key status?
export const computeKeyStatus = (visibleKeys:Set<string>, unlockedKeys: Array<string>, activeKeys:Set<string>, repeatableKeys:Set<string>, repeatToggleMode: boolean,
                                 stream: Array<Letter>, dict: Array<Transform>, unlockedTransforms: Set<number>):
    Map<string, KeyStatus> => {
  const result = new Map<string, KeyStatus>([]);
  const availableDict: Array<Transform> = unlockedDict(dict, unlockedTransforms);

  const letterTransforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const wordTransforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);
  const letterTransformKeys:Array<string> = Array.from(letterTransforms.keys());
      
  visibleKeys.forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));
  unlockedKeys.forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));

  wordTransforms.forEach((transformLocation: TransformLocation) => {
    const transform:Transform|undefined =  availableDict.find((t)=> t.id == transformLocation.id);
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
    if (repeatToggleMode && repeatableKeys.has(key))
      result.get(key)?.modes.add(KeyMode.RepeatToggleAvailable);
  });

  letterTransformKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.LetterTranform);
    result.get(key)?.modes.add(KeyMode.Available);
  });

  activeKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Active);
  });

  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Visible);
  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.WordTransformKey);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Visible);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.RepeatModeKey);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Modifier);
  if (repeatToggleMode)
    result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Active);
  if (repeatableKeys.size > 0)
    result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Available);
  if (wordTransforms.length != 0)
    result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Available);

  return result;
}

/*************/

const toggleKeyRepeat = ((key: string): [effect: Effect | undefined, GameStateUpdate]=>
  [undefined,
    ((gs: GameState) => {
      gs.toggleRepeatMode = false;
      if (gs.repeatingKeys.has(key))
        gs.repeatingKeys.delete(key);
      else
        gs.repeatingKeys.add(key);
  })]);

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
  else if (effect.type == EffectType.WordLengthUnlock) {
    const level:number = effect.level as number;
    return ((gs:GameState) => { gs.maxWordSize = level});
  }
  else if (effect.type == EffectType.LetterRepeaterUnlock) {
    const letter:string = effect.letter as string;
    return ((gs:GameState) => {
      gs.repeatableKeys.add(letter);
      if (!gs.repeatDelays.has(letter))
        gs.repeatDelays.set(letter, initialRepeatDelay);
     });
  }
  else if (effect.type == EffectType.UpgradeRepeater) {
    const letter:string = effect.letter as string;
    return ((gs:GameState) => {
      const currentDelay:number = gs.repeatDelays.get(letter) || initialRepeatDelay; // should always be defined, but...
      const factor:number = effect.level as number;
        gs.repeatDelays.set(letter, currentDelay / factor);
     });
  }
  else if (effect.type == EffectType.ToggleRepeater) {
    return ((gs:GameState) => { gs.toggleRepeatMode = !gs.toggleRepeatMode });
  }
  else if (effect.type == EffectType.TransformUnlock) {
    const id:number = effect.transform as number;
    return ((gs:GameState) => { gs.unlockedTransforms.add(id) });
  }
  return null;
}

const toggleRepeatEffect:Effect = {type: EffectType.ToggleRepeater};

export const executeKeyFunction = (key: string, status: KeyStatus, stream: Array<Letter>, dict:Array<Transform>, unlockedTransforms:Set<number>):
[effect: Effect | undefined, GameStateUpdate] => {
  const modes:Set<KeyMode> = status.modes;
  const availableDict: Array<Transform> = unlockedDict(dict, unlockedTransforms);

  // TODO : what to do if TRANSFORM and UNLOCKED?
  if (modes.has(KeyMode.RepeatModeKey) && modes.has(KeyMode.Available))
  {
    return [toggleRepeatEffect, null];
  }
    
  if (modes.has(KeyMode.RepeatToggleAvailable) && modes.has(KeyMode.Unlocked))
    return toggleKeyRepeat(key);
  else if (modes.has(KeyMode.WordTransform) && modes.has(KeyMode.Available))
    return wordTransform(stream, availableDict, key);
  else if (modes.has(KeyMode.LetterTranform) && modes.has(KeyMode.Available))
    return letterTransform(key, stream, availableDict);
  else if (modes.has(KeyMode.WordTransformKey) && modes.has(KeyMode.Available))
    return wordTransform(stream, availableDict);
  else if (modes.has(KeyMode.Unlocked) && modes.has(KeyMode.Letter))
    return directInput(key);
  /*
  // unused
  else if ( modes.has(KeyMode.Modifier) &&
           ((modes.has(KeyMode.Available) || modes.has(KeyMode.Unlocked))))
    return toggleModifier(key);
  */
  else 
    console.log("Error: key not available"); // should this case be intercepted higher up in the stack
  return [undefined, null];
}

export const execute = (key: string, keyStatus: Map<string, KeyStatus>,
                        stream: Array<Letter>, dict:Array<Transform>, unlockedTransforms:Set<number>):
    Array<GameStateUpdate> => {
  const status = keyStatus.get(key);
  if (!status)
  {
    //throw new Error('Error: unknown key : ' + key);
    console.log('Error: unknown key : ' + key);
    return [];
  }
  const [effect, transformResult] = executeKeyFunction (key, status, stream, dict, unlockedTransforms);
 
  const effectResult = effect ? executeEffect(effect, stream, dict) : null;
  if (transformResult && effectResult)
    return [effectResult, transformResult];
  else if (effectResult)
      return [effectResult];
  else if (transformResult)
    return [transformResult];
  return [];
}

const findTransform = (id: number, dict:Array<Transform>):Transform|undefined => {
  return dict.find((transform:Transform) => transform.id = id);
}

const directInput = (key: string):[effect: Effect | undefined, GameStateUpdate]  => {
  return [undefined,
    ((gs:GameState) => {
      gs.glyphs += 1;
      keyVisibility.forEach((visibility:number, key:string) => { if (visibility <= gs.glyphs) gs.visibleKeys.add(key)});
      gs.stream = Stream.addLetter(key, gs.stream);
    })];
}

const letterTransform = (key: string, stream:Array<Letter>, dict:Array<Transform>):
    [effect: Effect | undefined, GameStateUpdate] => {
  const transforms:Map<string, TransformLocation> = Stream.scanForLetters(stream, dict);
  const transformLocation = transforms.get(key);
  if (!transformLocation)
    throw new Error('Bug: transform not found');
  const id:number = transformLocation.id;
  const transform = dict.find((item:Transform) => item.id == id);
  if (!transform)
    throw new Error("Bug: transform id " + id.toString() + " not found");

  return [transform.effect, 
    ((gs:GameState) => {
      //gs.stream = Stream.addLetter(key, gs.stream);
      gs.lastTransform = transform;
      gs.stream = Stream.applyLetterTransform(transform, stream, transformLocation.location)
    })];
}

const wordTransform = (stream:Array<Letter>, dict:Array<Transform>, trigger:string=""):
   [effect: Effect | undefined, GameStateUpdate] => {
  let transforms:Array<TransformLocation> = Stream.scanForWords(stream, dict);

  if (trigger.length > 0)
  {
    transforms = transforms.filter((tl:TransformLocation) => findTransform(tl.id, dict)?.output == trigger);
  }
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

export const unlockedDict = (dict: Array<Transform>, unlockedTransforms:Set<number>):Array<Transform> => 
  dict.filter((transform:Transform) => unlockedTransforms.has(transform.id));
