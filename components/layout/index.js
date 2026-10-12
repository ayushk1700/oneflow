import { open as openCustomizer } from '../customizer/index.js';
/** Open the shared visual editor directly on responsive layout controls. */
export function open() { return openCustomizer('layout'); }
export const render = open;
export function init() {}
export function destroy() {}
