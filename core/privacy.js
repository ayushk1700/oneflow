import {get} from './storage.js';
/** Enforce the visible privacy preference at each network entry point. */
export function featureAllowed(name){return get().settings.customization?.behavior?.privacy?.[name]!==false;}
export function assertFeature(name){if(!featureAllowed(name))throw new Error('This external feature is off. Enable it in Personalize → Data.');}
