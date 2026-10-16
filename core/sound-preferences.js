import * as settings from './customization.js';
/** Sound controls edit the same versioned preferences as the customization drawer. */
export async function editSound(change){await settings.init();const next=settings.get();change(next.widgets.preferences.sounds);settings.replace(next);await settings.flush();}
