// The encrypted envelope must accommodate base64 expansion of every allowed plain backup.
export const MAX_BACKUP_BYTES = 128 * 1024 * 1024;
export const MAX_ENCRYPTED_BYTES = Math.ceil((MAX_BACKUP_BYTES + 16) / 3) * 4 + 1024;
/** Reject oversized output before a successful download can be reported. @param {string} text */
export function checkBackupSize(text, encrypted = false) {
  if (new Blob([text]).size > (encrypted ? MAX_ENCRYPTED_BYTES : MAX_BACKUP_BYTES)) {
    throw new Error(encrypted ? 'Encrypted backup exceeds the supported size.' : 'Backup exceeds 128 MB. Export fewer attachments before trying again.');
  }
}
