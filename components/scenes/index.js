import { getRecord } from '../../core/db.js';
import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { openPanel, field, act, confirmAction, isPanel, panelRequest } from '../../core/ui.js';
import { catalog, snapshot, applyScene, undoScene } from '../../core/scenes.js';
import { backgroundSync } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { backgroundCatalog, backgroundSource } from '../../core/background-presentation.js';
import { imagePreview } from '../../core/image-preview.js';
import { library } from '../panel-design/index.js';
async function sync() {
  if (globalThis.chrome?.runtime?.id) await backgroundSync();else await (await import('../sounds/index.js')).syncAudio();
}
export async function open() {
  const isCurrent = panelRequest();
  const previewURLs = [];
  const root = el('div', {
    class: 'stack'
  }, el('p', {
    class: 'muted'
  }, translate('m0346')));
  let owns=()=>false;const refresh=()=>owns()&&root.isConnected&&isPanel('scenes')?open():undefined;
  const name = el('input', {
    maxlength: 80,
    placeholder: translate('m0347')
  });
  const capture=el('details',{},el('summary',{},'Save your current environment'));root.append(capture);capture.append(field(translate('m0348'), name), el('button', {
    class: 'primary',
    onclick: act(async () => {
      if (!name.value.trim()) throw new Error(translate('m0349'));
      await update(d => {
        d.scenes.push({
          id: uid(),
          name: name.value.trim(),
          snapshot: snapshot(d)
        });
      });
      await refresh();
    })
  }, translate('m0350')));
  const [scenes, backgrounds] = await Promise.all([catalog(), backgroundCatalog()]);
  const collection=library(root,{name:'scenes',heading:'Scenes',filters:['Built-in','Saved'],variant:'garden'});
  for (const scene of scenes) {
    const rename = el('input', {
      value: scene.name,
      maxlength: 80,
      'aria-label': translate('m0351', {
        p0: scene.name
      })
    });
    const row = el('article', {
      class: 'entry-card scene-card stack'
    }, el('h3', {}, scene.name), el('small', {
      class: 'muted'
    }, get().sceneId === scene.id ? translate('m0352') : scene.builtin ? translate('m0353') : translate('m0354')), el('div', {
      class: 'row wrap'
    }, el('button', {
      class:'primary',onclick: act(async () => {
        await applyScene(scene.id);
        await sync();
        await refresh();
      })
    }, translate('m0355')), el('button', {
      onclick: act(async () => {
        await update(d => {
          d.sceneId = scene.id;
        });
        await refresh();
      })
    }, translate('m0356')), el('button', {
      onclick: act(async () => {
        await update(d => {
          d.scenes.push({
            id: uid(),
            name: translate('m0691', {
              p0: scene.name.slice(0, 70)
            }),
            snapshot: structuredClone(scene.snapshot)
          });
        });
        await refresh();
      })
    }, translate('m0357'))));
    const manage=el('details',{},el('summary',{},'Manage scene'));manage.append(row.querySelectorAll('.row button')[2]);row.append(manage);
    if (!scene.builtin) manage.append(field(translate('m0358'), rename), el('button', {
      onclick: act(async () => {
        if (!rename.value.trim()) throw new Error(translate('m0349'));
        await update(d => {
          d.scenes.find(x => x.id === scene.id).name = rename.value.trim();
        });
        await refresh();
      })
    }, translate('m0359')), el('button', {
      onclick: () => confirmAction(row, translate('m0360'), async () => {
        await update(d => {
          d.scenes = d.scenes.filter(x => x.id !== scene.id);
          if (d.sceneId === scene.id) d.sceneId = 'deep-work';
        });
        await refresh();
      })
    }, translate('m0361')));
    const preview = el('details', {open:''}, el('summary', {}, translate('m0362')), el('p', {}, translate('m0692', {
      p0: scene.snapshot.timerConfig.focus,
      p1: scene.snapshot.settings.theme,
      p2: scene.snapshot.settings.background.id
    })), el('p', {}, translate('m0364', {
      p0: Object.entries(scene.snapshot.audio.volumes).filter(([, value]) => value > 0).map(([name]) => name).join(', ') || translate('m0363')
    })));
    const background = scene.snapshot.settings.background;
    const artwork = backgrounds.find(item => item.id === background.id);
    if (background.kind === 'bundled' && artwork) {
      const image = el('img', { src: backgroundSource(artwork,true), alt: `${scene.name} atmosphere`, loading: 'lazy', decoding: 'async', width: 384, height: 216, class: 'scene-preview-image' });
      image.style.objectPosition = artwork.position.map(n => `${n}%`).join(' '); preview.prepend(image);
    }
    if (background.kind === 'solid' || background.kind === 'gradient') { const swatch = el('div', { class: 'scene-preview-image', role: 'img', 'aria-label': `${scene.name} atmosphere` }); swatch.style.background = background.kind === 'solid' ? background.color : `linear-gradient(135deg, ${background.color}, #203c36)`; preview.append(swatch); }
    if (background.kind === 'upload') {
      let pending = false;
      preview.addEventListener('toggle', act(async () => {
        if (!preview.open || preview.querySelector('img') || pending) return;
        pending = true;
        try {
          const record = await getRecord('images', background.id);
          if (!record?.blob) { if (preview.isConnected && !preview.querySelector('.preview-missing')) preview.append(el('p', {class:'preview-missing'}, translate('This photo is no longer available.'))); return; }
          const blob = await imagePreview(record.blob);
          if (!isPanel('scenes') || !preview.isConnected || !preview.open) return;
          const url = URL.createObjectURL(blob); previewURLs.push(url);
          preview.append(el('img', { src: url, alt: `${scene.name} atmosphere`, decoding:'async', width:384, height:216, class: 'scene-preview-image' }));
        } finally { pending = false; }
      }));
    }
    row.append(preview);
    const thumbnail=background.kind==='bundled'&&artwork?el('img',{src:backgroundSource(artwork,true),alt:'',loading:'lazy',decoding:'async'}):undefined;
    collection.add({id:scene.id,title:scene.name,summary:`${scene.snapshot.timerConfig.focus} min · ${get().sceneId===scene.id?'Selected':scene.builtin?'Built-in':'Saved'}`,status:scene.builtin?'Built-in':'Saved',image:thumbnail,detail:row});
  }
  root.append(el('button', {
    disabled: !get().sceneUndo,
    onclick: act(async () => {
      await undoScene();
      await sync();
      emit('toast', translate('m0365'));
      await refresh();
    })
  }, translate('m0366')));
  if (isCurrent()){openPanel(translate('m0037'), 'scenes', root, () => previewURLs.forEach(url => URL.revokeObjectURL(url)));owns=panelRequest();}
}
export const render = open;
export function init() {}
export function destroy() {}
