/** Lazy IndexedDB driver; preserve the existing storage API and startup budget. */
export const STORES = ['journal', 'sessions', 'images', 'wallpapers', 'notes', 'noteMedia', 'focusSamples'];
import { activeSpaceId } from './storage.js';
let driver;
/** MV3 workers preload this same driver because dynamic imports are forbidden. */
export function useDatabaseDriver(value){driver=Promise.resolve(value);}
const load=()=>driver??=(import('./database-store.js').catch(error=>{driver=null;throw error;}));
export const openDB=async(...args)=>(await load()).openDB(...args);
export const getRecord=async(store,id,space=activeSpaceId())=>(await load()).getRecord(store,id,space);
export const getAll=async(store,options={})=>{const captured={space:activeSpaceId(),...options};return (await load()).getAll(store,captured);};
export const put=async(store,value,space=activeSpaceId())=>(await load()).put(store,value,space);
export const remove=async(store,id,space=activeSpaceId())=>(await load()).remove(store,id,space);
export const transaction=async(stores,change,space=activeSpaceId())=>(await load()).transaction(stores,change,space);
export const replaceAll=async(...args)=>(await load()).replaceAll(...args);
export const changeSpaceRecords=async(...args)=>(await load()).changeSpaceRecords(...args);
