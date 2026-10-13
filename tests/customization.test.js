import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateSettings, migrateSettings, resolveTheme, contrast } from '../core/customization-schema.js';
const base = JSON.parse(fs.readFileSync('data/customization-defaults.json'));
test('Stage 1 defaults and six bundled palettes validate', () => {
  validateSettings(base,base);
  for (const theme of JSON.parse(fs.readFileSync('data/customization-themes.json'))) { const value=structuredClone(base);Object.assign(value.theme,{mode:theme.mode,accent:theme.accent,palette:theme.palette,paletteEnabled:true});validateSettings(value,base); }
});
test('customization import rejects unknown nested fields, unsafe values and future versions', () => {
  for(const modify of [v=>delete v.theme,v=>delete v.theme.palette.surface,v=>v.extra=true,v=>v.theme.extra=true,v=>v.background.url='javascript:alert(1)',v=>v.schemaVersion=99,v=>v.theme.typography.scale=100,v=>v.theme.schedule.dark=v.theme.schedule.light,v=>v.theme.customThemes=[{name:'Bad',mode:'dark',accent:'#123456',palette:v.theme.palette,css:'bad'}]]){const value=structuredClone(base);modify(value);assert.throws(()=>migrateSettings(value,base));}
  const value=structuredClone(base);delete value.schemaVersion;assert.equal(migrateSettings(value,base).schemaVersion,1);
});
test('scheduled themes handle overnight intervals and exact boundaries',()=>{
  const theme={mode:'scheduled',schedule:{light:'07:00',dark:'19:00'}};
  assert.equal(resolveTheme(theme,false,new Date(2026,9,14,7,0)),'light');
  assert.equal(resolveTheme(theme,false,new Date(2026,9,14,19,0)),'dark');
  theme.schedule={light:'19:00',dark:'07:00'};assert.equal(resolveTheme(theme,false,new Date(2026,9,14,23,0)),'light');
  assert.equal(resolveTheme({mode:'auto'},true),'dark');assert.equal(contrast('#000000','#ffffff'),21);
});
