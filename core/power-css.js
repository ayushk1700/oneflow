const properties=new Set(['color','background-color','border-color','border-width','border-style','border-radius','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','text-decoration','padding','padding-inline','padding-block','margin','margin-inline','margin-block','gap','opacity','box-shadow']);
/** Compile a deliberately small CSS language, scoped below the dashboard only. */
export function sanitizeCSS(input){
 if(typeof input!=='string'||new TextEncoder().encode(input).length>8192)throw new Error('Custom CSS must be under 8 KB.');
 if(/\\|@|[<>\u0000-\u0008\u000b-\u001f]|\b(?:url|image-set|expression|element|attr)\s*\(/i.test(input))throw new Error('Custom CSS cannot contain imports, resources, escapes or active content.');
 const source=input.replace(/\/\*[\s\S]*?\*\//g,'');if(source.includes('/*')||source.includes('*/'))throw new Error('Unclosed CSS comment.');
 let result='',cursor=0;const expression=/([^{}]+)\{([^{}]*)\}/g;let match;
 while((match=expression.exec(source))){if(source.slice(cursor,match.index).trim())throw new Error('Invalid CSS block.');cursor=expression.lastIndex;
  const selectors=match[1].trim().split(',').map(selector=>selector.trim());if(selectors.length>12||selectors.some(selector=>!selector||selector.length>200||!/^[\w.#\s>+-]+(?::(?:hover|focus|focus-visible|first-child|last-child))?$/.test(selector)||/\b(?:html|body)\b|:root|:host/i.test(selector)))throw new Error('Use simple dashboard selectors; page-root selectors are not allowed.');
  const declarations=[];for(const declaration of match[2].split(';')){if(!declaration.trim())continue;const colon=declaration.indexOf(':');if(colon<0)throw new Error('Invalid CSS declaration.');const property=declaration.slice(0,colon).trim().toLowerCase(),value=declaration.slice(colon+1).trim();if(!properties.has(property)||!value||value.length>256||/!|[{};]/.test(value))throw new Error('Unsupported custom CSS property or value: '+property);if(globalThis.CSS?.supports&&!CSS.supports(property,value))throw new Error('Invalid CSS value: '+property);declarations.push(property+':'+value);}
  result+=selectors.map(selector=>'#main '+selector).join(',')+'{'+declarations.join(';')+'}\n';
 }
 if(source.slice(cursor).trim())throw new Error('Invalid or unclosed CSS.');return result;
}
