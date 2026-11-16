import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const manifestPath = new URL('../public/downloads/infinity-ramal-update.json', import.meta.url);
const release = JSON.parse(readFileSync(manifestPath, 'utf8'));
const apk = readFileSync(new URL('infinity-ramal.apk', manifestPath));
const hash = createHash('sha256').update(apk).digest('hex');

if (!Number.isSafeInteger(release.versionCode) || release.versionCode < 1
    || typeof release.versionName !== 'string' || !release.versionName.trim()
    || release.sha256 !== hash) {
  throw new Error('APK e manifesto do Ramal divergem. Use scripts/stage-ramal-release.ps1.');
}
