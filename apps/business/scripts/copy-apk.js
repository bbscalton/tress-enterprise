import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const apkSrc = join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const apkDest = join('public', 'tress-enterprise-business.apk');

if (!existsSync(apkSrc)) {
  console.error('APK not found at', apkSrc);
  process.exit(1);
}

copyFileSync(apkSrc, apkDest);
console.log('Copied APK to', apkDest);
