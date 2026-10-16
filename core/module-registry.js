const modules=new Map(),loaders=new Map();
/** Shared code requests modules without invoking a dynamic import in a worker. */
export function registerModule(name,value){modules.set(name,Promise.resolve(value));}
/** Only Window entry points install lazy loaders. */
export function registerLoader(name,loader){loaders.set(name,loader);}
export function loadModule(name){if(!modules.has(name)){const loader=loaders.get(name);if(!loader)return Promise.reject(new Error(`ONEFLOW module was not registered: ${name}. Reload the extension.`));modules.set(name,Promise.resolve().then(loader).catch(error=>{modules.delete(name);throw error;}));}return modules.get(name);}
