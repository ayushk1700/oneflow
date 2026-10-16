export const DEFAULT_HOTKEYS={task:'N',flow:'F',search:'/',timer:'Space',settings:'S',commands:'Mod+K',space:'Alt+Shift+S'};
/** Normalize and reject common browser/system shortcuts rather than stealing them. */
export function normalizeHotkey(value){
 if(typeof value!=='string'||value.length>40)throw new Error('Invalid hotkey.');const parts=value.split('+'),key=parts.pop(),modifiers=['Mod','Alt','Shift'].filter(modifier=>parts.includes(modifier));
 if(parts.some(part=>!modifiers.includes(part))||new Set(parts).size!==parts.length||!key||!/^([a-z0-9/]|Space|F[2-9]|F10)$/i.test(key))throw new Error('Use a letter, /, Space or F2–F10 with Mod, Alt or Shift.');
 const canonical=key.length===1?key.toUpperCase():key.toLowerCase()==='space'?'Space':key.toUpperCase();const result=[...modifiers,canonical].join('+');
 if(canonical==='F5'||canonical==='F10'||modifiers.includes('Mod')&&result!=='Mod+K'||modifiers.includes('Alt')&&!modifiers.includes('Shift'))throw new Error('That combination is reserved by the browser or operating system.');
 return result;
}
export function validateHotkeys(keys){const normalized=Object.keys(DEFAULT_HOTKEYS).map(action=>normalizeHotkey(keys[action]));if(new Set(normalized).size!==normalized.length)throw new Error('Hotkeys conflict. Choose a different combination.');return keys;}
export function hotkeyMatches(event,binding){const parts=binding.split('+'),key=parts.pop();return Boolean(event.ctrlKey||event.metaKey)===parts.includes('Mod')&&Boolean(event.altKey)===parts.includes('Alt')&&Boolean(event.shiftKey)===parts.includes('Shift')&&(key==='Space'?event.code==='Space':event.key.toUpperCase()===key.toUpperCase());}
