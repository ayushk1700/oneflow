import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const inventory = JSON.parse(await fs.readFile('vendor/integrity.json', 'utf8'));
for (const dependency of inventory.dependencies) for (const file of dependency.files) {
  const hash = createHash('sha256').update(await fs.readFile(file.path)).digest('hex');
  if (hash !== file.sha256) throw new Error(`Dependency integrity mismatch: ${file.path}. Review provenance before updating the recorded hash.`);
}
console.log(`PASS: ${inventory.dependencies.length} pinned dependency/license hashes, including documented local patches.`);
