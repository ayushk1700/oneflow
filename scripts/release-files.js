import fs from 'node:fs/promises';
import path from 'node:path';
export const runtimeRoots = ['newtab', 'background', 'blocked', 'components', 'core', 'data', 'assets', 'vendor', 'wallpaper', 'livewallpaper'];
const excluded = file => /^(?:components\/(?:ai|unsplash)\/|vendor\/(?:lucide|sortablejs|canvas-confetti)\/)/.test(file) || file === 'core/ai.js';
/** Release file policy rejects unexpected files instead of silently adding them to the ZIP. */
export async function releaseFiles(root) {
  const approved = JSON.parse(await fs.readFile(path.join(root, 'scripts/release-files.json'), 'utf8'));
  const files = new Set(approved);
  const safePath = file => typeof file === 'string' && !file.startsWith('/') && !file.includes('\\') && !file.split('/').some(part => part === '..' || part.startsWith('.')) && !/(?:\.map$|\.test\.|\.spec\.|(?:^|\/)(?:test|tests|test-results|node_modules)(?:\/|$))/i.test(file);
  for (const file of files) {
    if (!safePath(file)) throw new Error(`Forbidden release path: ${file}`);
    const resolved = await fs.realpath(path.join(root, file));
    if (!resolved.startsWith(path.resolve(root) + path.sep)) throw new Error(`Release path leaves the workspace: ${file}`);
    if ((await fs.lstat(path.join(root, file))).isSymbolicLink()) throw new Error(`Release symlink rejected: ${file}`);
  }
  async function walk(folder) {
    for (const entry of await fs.readdir(path.join(root, folder), { withFileTypes: true })) {
      const file = `${folder}/${entry.name}`;
      if (excluded(file + (entry.isDirectory() ? '/' : ''))) continue;
      if (entry.isSymbolicLink()) throw new Error(`Release symlink rejected: ${file}`);
      if (entry.isDirectory()) await walk(file);
      else if (!files.has(file)) throw new Error(`Unreviewed runtime file: ${file}. Review it before changing scripts/release-files.json.`);
    }
  }
  for (const folder of runtimeRoots) await walk(folder);
  return [...files].sort();
}
