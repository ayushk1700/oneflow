import { readWork,updateWork } from './storage.js';
/** Small local launcher preferences travel with existing workspace backups. @returns {Promise<object>} */
export async function preferences(){const w=await readWork();return w.toolbox||{favorites:[],recent:[]};}
/** A launch is recorded locally only when a tool is explicitly chosen. @param {string} id */
export async function remember(id){await updateWork(w=>{w.toolbox??={favorites:[],recent:[]};w.toolbox.recent=[id,...w.toolbox.recent.filter(x=>x!==id)].slice(0,6);});}
/** Toggle one named favorite without overwriting another window's choices. @param {string} id */
export async function favorite(id){await updateWork(w=>{w.toolbox??={favorites:[],recent:[]};const ids=w.toolbox.favorites;w.toolbox.favorites=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id].slice(-20);});}
