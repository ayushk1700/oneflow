import {registerLoader} from './module-registry.js';
registerLoader('database',()=>import('./database-store.js'));
registerLoader('work',()=>import('./work-schema.js'));
registerLoader('notes-preferences',()=>import('./notes-preferences.js'));
registerLoader('recovery',()=>import('./storage-recovery.js'));
registerLoader('sounds',()=>import('../components/sounds/index.js'));
registerLoader('timer-engine',()=>import('./timer-engine.js'));
