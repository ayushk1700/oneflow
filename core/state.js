import { on, emit } from './events.js';
const state = { panel: null };
/** Read transient state. Persistent data belongs in storage. */
export const getState = () => ({ ...state });
on('panel:open', panel => { state.panel = panel; emit('state:change', getState()); });
on('panel:closed', () => { state.panel = null; emit('state:change', getState()); });
