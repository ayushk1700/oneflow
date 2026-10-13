import { t as translate } from './i18n.js';
import { checkBackupSize, MAX_BACKUP_BYTES } from './backup-limits.js';
const encoder = new TextEncoder(),
  decoder = new TextDecoder(),
  iterations = 310000;
const encode = bytes => {
  let value = '';
  for (let i = 0; i < bytes.length; i += 8192) value += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(value);
};
const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
async function derive(passphrase, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ["deriveKey"]);
  return crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt,
    iterations,
    hash: 'SHA-256'
  }, material, {
    name: 'AES-GCM',
    length: 256
  }, false, ['encrypt', 'decrypt']);
}
/** Encrypt locally; a forgotten passphrase cannot be recovered. */
export async function encryptBackup(text, passphrase) {
  checkBackupSize(text);
  if (passphrase.length < 12) throw new Error(translate('m0012'));
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12)),
    key = await derive(passphrase, salt);
  const data = new Uint8Array(await crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv
  }, key, encoder.encode(text)));
  return JSON.stringify({
    app: translate('m0630'),
    encrypted: 1,
    kdf: 'PBKDF2-SHA256',
    iterations,
    cipher: 'AES-256-GCM',
    salt: encode(salt),
    iv: encode(iv),
    data: encode(data)
  });
}
/** Authenticate the entire ciphertext before returning any backup contents. */
export async function decryptBackup(text, passphrase) {
  checkBackupSize(text, true);
  const box = JSON.parse(text);
  if (box.app !== translate('m0630') || box.encrypted !== 1 || box.iterations !== iterations || box.kdf !== 'PBKDF2-SHA256' || box.cipher !== 'AES-256-GCM' || !['salt', 'iv', 'data'].every(k => typeof box[k] === 'string' && /^[A-Za-z0-9+/=]+$/.test(box[k]))) throw new Error(translate('m0014'));
  const salt = decode(box.salt),
    iv = decode(box.iv);
  if (salt.length !== 16 || iv.length !== 12) throw new Error(translate('m0015'));
  if (box.data.length > Math.ceil((MAX_BACKUP_BYTES + 16) / 3) * 4) throw new Error('Encrypted payload exceeds the supported size.');
  try {
    return decoder.decode(await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv
    }, await derive(passphrase, salt), decode(box.data)));
  } catch {
    throw new Error(translate('m0016'));
  }
}
