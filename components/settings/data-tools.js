import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { exportData, parseBackup, importData, resetData } from '../../core/backup.js';
import { encryptBackup, decryptBackup } from '../../core/crypto-backup.js';
import { diagnostics, storageUsage } from '../../core/diagnostics.js';
import { el, download, dayKey } from '../../core/utils.js';
import { field, act, confirmAction } from '../../core/ui.js';
import { backgroundSync } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { MAX_ENCRYPTED_BYTES } from '../../core/backup-limits.js';
/** Local-only backup, restore, diagnostic and storage controls. */
export async function render(body) {
  if (!globalThis.chrome?.runtime?.id) {
    const recovered = (await import('../../core/storage-recovery.js')).recoveryRecords();
    if (Object.keys(recovered).length) body.append(el('p', { role: 'alert' }, 'Damaged preview data was preserved. Download it before deleting all data. It may contain private records and keys.'), el('button', { type: 'button', onclick: () => download(new Blob([JSON.stringify(recovered)], { type: 'application/json' }), 'oneflow-recovered-data.json') }, 'Download recovered data'));
  }
  body.append(el('section', { class: 'stack' }, el('h4', {}, 'Keep a recoverable copy'),
    el('p', {}, 'Tasks, journal entries and focus history stay in this browser profile. Export before uninstalling or moving to another computer. Only small preferences use browser sync.'),
    el('p', { class: 'muted' }, get().backup.lastExport ? `Last backup: ${new Date(get().backup.lastExport).toLocaleDateString()}. Keep the downloaded file somewhere you can find it.` : 'No backup exported yet. Download one below; a passphrase is optional.'),
    el('details', {}, el('summary', {}, 'How to restore on another browser'), el('p', {}, '1. Export here. 2. Install ONEFLOW in the other browser. 3. Open Settings → Data & privacy and choose that backup. Enter its passphrase if encrypted. Review the replacement confirmation. A lost passphrase cannot be recovered.'))));
  const password = el('input', {
    type: 'password',
    autocomplete: 'new-password',
    minlength: 12,
    'aria-label': translate('m0372')
  });
  const includeKeys = el('input', { type: 'checkbox', 'aria-label': 'Include saved service keys in encrypted backup' });
  body.append(el('label', { class: 'toggle-row' }, el('span', {}, 'Include saved service keys (requires a passphrase)'), includeKeys));
  body.append(el('p', {
    class: 'muted'
  }, translate('m0373')), field(translate('m0374'), password), el('button', {
    class: 'primary',
    onclick: act(async () => {
      if (includeKeys.checked && !password.value) throw new Error('Add a passphrase before including saved service keys.');
      const plain = JSON.stringify(await exportData({ includeKeys: includeKeys.checked })),
        content = password.value ? await encryptBackup(plain, password.value) : plain;
      download(new Blob([content], {
        type: 'application/json'
      }), `oneflow-${dayKey()}${password.value ? '-encrypted' : ''}.json`);
      await update(d => {
        d.backup.lastExport = Date.now();
      });
      await backgroundSync();
      password.value = '';
      emit('toast', translate('m0375'));
    })
  }, translate('m0376')));
  const restorePassword = el('input', {
    type: 'password',
    autocomplete: 'off',
    'aria-label': translate('m0377')
  });
  body.append(field(translate('m0378'), restorePassword), field(translate('m0379'), el('input', {
    type: 'file',
    accept: '.json,application/json',
    onchange: act(async e => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (file.size > MAX_ENCRYPTED_BYTES) throw new Error('Backup exceeds the supported file size.');
      let text = await file.text();
      if (JSON.parse(text)?.encrypted) text = await decryptBackup(text, restorePassword.value);
      restorePassword.value = '';
      const prepared = await parseBackup(text);
      confirmAction(body, translate('m0381', {
        p0: prepared.local.tasks.length,
        p1: prepared.records.images.length
      }), async () => {
        await importData(prepared);
        location.reload();
      });
    })
  })), el('button', {
    onclick: act(async () => download(new Blob([JSON.stringify(await diagnostics(), null, 2)], {
      type: 'application/json'
    }), 'oneflow-diagnostics.json'))
  }, translate('m0387')), el('p', {
    class: 'muted'
  }, translate('m0388')));
  const size = await storageUsage();
  body.append(el('p', {
    class: 'muted'
  }, translate('m0389', {
    p0: (size.local / 1048576).toFixed(2),
    p1: (size.images / 1048576).toFixed(2)
  })));
  if (size.local > 8 * 1048576 || size.estimate?.quota && size.estimate.usage / size.estimate.quota > .8) body.append(el('p', {
    role: 'alert'
  }, translate('m0390')));
  body.append(el('footer', {class:'danger-zone'}, el('button', {
    class: 'danger',
    onclick: () => confirmAction(body, translate('m0391'), async () => {
      await resetData();
      location.reload();
    })
  }, translate('m0392'))));
}
