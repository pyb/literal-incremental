import {KeyStatus, KeyMode, Word, GameState, Transform, LogItem, TransformLocation, Letter, Effect, EffectType, GameStateUpdate} from "game/gameTypes"
import * as StreamOp from "game/streamops"
import {specialKeys, keyVisibility, initialRepeatDelay} from "game/gameData"
import UIData from "UI/uiData"

const addLog = (message: string, gs: GameState) => {
    gs.log.splice(0, 1) // remove first
    const logItem: LogItem = {
      text: message,
      key: gs.logKey
    }
    gs.logKey += 1;
    gs.log.push(logItem);
}

const createEmptyKeyStatus = (key:string):KeyStatus => ({
  key:key,
  modes: new Set<KeyMode>
});

/****************************************/
// Views

// Note: This is a "View" ie an alternative way or presenting game state data
//export const computeKeyStatus = (visibleKeys:Set<string>, unlockedKeys: Set<string>, activeKeys:Set<string>, repeatableKeys:Set<string>, repeatToggleMode: boolean,
//                                 stream: Array<Letter>, dict: Array<Transform>, visibleTransforms: Set<number>, unlockedTransforms: Set<number>)
  export const computeKeyStatus = (GS:GameState) :Map<string, KeyStatus> => {
  const result = new Map<string, KeyStatus>([]);
  const availableDict: Array<Transform> = unlockedDict(GS.dict, GS.visibleTransforms, GS.unlockedTransforms);

  const letterTransforms:Map<string, TransformLocation> = StreamOp.scanForLetters(GS.stream, GS.dict);
  const wordTransforms:Array<TransformLocation> = StreamOp.scanForWords(GS.stream, GS.dict);
  const letterTransformKeys:Array<string> = Array.from(letterTransforms.keys());

  [...GS.visibleKeys, ...GS.unlockedKeys].forEach((key:string) =>
    result.set(key, createEmptyKeyStatus(key)));

  wordTransforms.forEach((transformLocation: TransformLocation) => {
    const transform =  availableDict.find((t)=> t.id == transformLocation.id);
    if (transform)
    {
      const key = transform.output;
      if (key && key.length == 1)
      {
        result.get(key)?.modes.add(KeyMode.WordTransform);
        result.get(key)?.modes.add(KeyMode.Available);
      }
      else
        result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Available);
    }
  });

  GS.visibleKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Visible);
    if (!specialKeys.has(key))
      result.get(key)?.modes.add(KeyMode.Letter);
  });

  GS.unlockedKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Unlocked);
    result.get(key)?.modes.add(KeyMode.Available);
    if (GS.toggleRepeatMode && GS.repeatableKeys.has(key))
      result.get(key)?.modes.add(KeyMode.RepeatToggleAvailable);
  });

  letterTransformKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.LetterTranform);
    result.get(key)?.modes.add(KeyMode.Available);
  });

  GS.activeKeys.forEach((key:string) => {
    result.get(key)?.modes.add(KeyMode.Active);
  });

  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.Visible);
  result.get(UIData.wordTransformKey)?.modes.add(KeyMode.WordTransformKey);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Visible);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.RepeatModeKey);
  result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Modifier);
  if (GS.toggleRepeatMode)
    result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Active);
  if (GS.repeatableKeys.size > 0)
    result.get(UIData.repeatModeKey)?.modes.add(KeyMode.Available);

  return result;
}

export const unlockedDict = (dict: Array<Transform>, visibleTransforms: Set<number>, unlockedTransforms:Set<number>)
    :Array<Transform> => 
  dict.filter((transform:Transform) => (unlockedTransforms.has(transform.id) && visibleTransforms.has(transform.id)));

/*********************************/

const toggleKeyRepeat = ((key: string): [effect: Effect | undefined, GameStateUpdate]=>
  [undefined,
    ((gs: GameState) => {
      gs.toggleRepeatMode = false;
      if (gs.repeatingKeys.has(key))
        gs.repeatingKeys.delete(key);
      else
        gs.repeatingKeys.add(key);
  })]);

/*********************************/
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

export const executeEffect = (effect:Effect, stream:Array<Letter>, dict:Array<Transform>):GameStateUpdate => {
  const type:EffectType = effect.type;
  const letter:string = effect.letter as string; // this is sometimes undefined, but always defined when we need it below
  const level:number = effect.level as number; // ditto
  const id:number = effect.transform as number; // ...

  if (type == EffectType.LetterUnlock) {
    return ((gs:GameState) => {
      gs.unlockedKeys.add(letter);
      gs.visibleKeys.add(letter);
      if (!gs.repeatDelays.has(letter))
        gs.repeatDelays.set(letter, initialRepeatDelay);
    });
  }
  else if (type == EffectType.WordLengthUnlock) {
    return ((gs:GameState) => {
      gs.maxWordSize = level;
    });
  }
  else if (type == EffectType.LetterRepeaterUnlock) {
    return ((gs:GameState) => {
      gs.repeatableKeys.add(letter);
     });
  }
  else if (type == EffectType.UpgradeRepeater) {
    return ((gs:GameState) => {
      const currentDelay:number = gs.repeatDelays.get(letter) || initialRepeatDelay; // should always be defined, but...
      gs.repeatDelays.set(letter, currentDelay / level);
     });
  }
  else if (type == EffectType.ToggleRepeater) {
    return ((gs:GameState) => {
      gs.toggleRepeatMode = !gs.toggleRepeatMode;
    });
  }
  else if (type == EffectType.TransformUnlock) {
    return ((gs:GameState) => {
      gs.unlockedTransforms.add(id);
    });
  }
  else
    return null;
}

const toggleRepeatEffect:Effect = {type: EffectType.ToggleRepeater};

export const executeKeyFunction = (key: string, status: KeyStatus, stream: Array<Letter>, dict:Array<Transform>,
    visibleTransforms:Set<number>, unlockedTransforms:Set<number>)
    :[Effect | undefined, GameStateUpdate] => {
 
  const modes:Set<KeyMode> = status.modes;
  const availableDict: Array<Transform> = unlockedDict(dict, visibleTransforms, unlockedTransforms);

  // TODO : what to do if TRANSFORM and UNLOCKED?
  if (modes.has(KeyMode.RepeatModeKey) && modes.has(KeyMode.Available))
  {
    return [toggleRepeatEffect, null];
  }
  
  if (modes.has(KeyMode.RepeatToggleAvailable) && modes.has(KeyMode.Unlocked))
    return toggleKeyRepeat(key);
  else if (modes.has(KeyMode.WordTransformKey) && modes.has(KeyMode.Available))
    return wordTransform(stream, availableDict);
  else if (modes.has(KeyMode.WordTransform) && modes.has(KeyMode.Available))
    return wordTransform(stream, availableDict, key);
  else if (modes.has(KeyMode.LetterTranform) && modes.has(KeyMode.Available))
    return letterTransform(key, stream, availableDict);
  else if (modes.has(KeyMode.Unlocked) && modes.has(KeyMode.Letter))
    return directInput(key);
  /*
  // unused. obsolete?
  else if ( modes.has(KeyMode.Modifier) &&
           ((modes.has(KeyMode.Available) || modes.has(KeyMode.Unlocked))))
    return toggleModifier(key);
  */
  else 
    console.log("Error: key not available"); // should this case be intercepted higher up in the stack
  return [undefined, null];
}

export const execute = (key: string, keyStatus: Map<string, KeyStatus>,
                        stream: Array<Letter>, dict:Array<Transform>, visibleTransforms: Set<number>, unlockedTransforms:Set<number>):
    Array<GameStateUpdate> => {
  const status = keyStatus.get(key);
  if (!status)
  {
    //throw new Error('Error: unknown key : ' + key);
    console.log('Error: unknown key : ' + key);
    return [];
  }
  const [effect, transformResult] = executeKeyFunction(key, status, stream, dict, visibleTransforms, unlockedTransforms);
 
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
      const glyphs = gs.glyphs + 1;
      gs.glyphs = glyphs;
      keyVisibility.forEach((visibility:number, key:string) => { if (visibility == glyphs) {
        addLog("Key available : " + key, gs);
        gs.visibleKeys.add(key);
      } });
      gs.dict.forEach((transform:Transform) => {
        if (transform.visibility && transform.visibility == glyphs)
        {
          if (transform.shortDesc)
            addLog("Transform available : " + (transform.n ? transform.n.toString() : "") + transform.shortDesc , gs);
          else
            addLog("Transform available.", gs);
          gs.visibleTransforms.add(transform.id);
        }
      });
      gs.stream = StreamOp.addLetter(key, gs.stream);
      gs.destroyed = undefined;
    })];
}

const letterTransform = (key: string, stream:Array<Letter>, dict:Array<Transform>):
    [effect: Effect | undefined, GameStateUpdate] => {
  const transforms:Map<string, TransformLocation> = StreamOp.scanForLetters(stream, dict);
  const transformLocation = transforms.get(key);
  if (!transformLocation)
  {
    throw new Error('Bug: transform not found');
  } 
  const id:number = transformLocation.id;
  const transform = dict.find((item:Transform) => item.id == id);
  if (!transform)
    throw new Error("Bug: transform id " + id.toString() + " not found");

  return [transform.effect, 
    ((gs:GameState) => {
      //gs.stream = Stream.addLetter(key, gs.stream);
      gs.lastTransform = transform;
      gs.stream = StreamOp.applyLetterTransform(transform, stream, transformLocation.location);
      gs.destroyed = undefined;
    })];
}

const wordTransform = (stream:Array<Letter>, dict:Array<Transform>, trigger:string=""):
   [Effect | undefined, GameStateUpdate] => {
  let transforms:Array<TransformLocation> = StreamOp.scanForWords(stream, dict);
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
    const wordTransformResult:StreamOp.WordTransformResult = StreamOp.applyWordTransform(transform, stream);
    gs.stream = wordTransformResult.result;
    gs.destroyed = wordTransformResult.destroyed;
    gs.destroyedLocation = wordTransformResult.destroyedLocation || 0;
  })];
}
