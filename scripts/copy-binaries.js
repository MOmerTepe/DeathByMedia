// Copies the ffmpeg-static binary into bin/ before packaging so the app
// ships it as a plain file in resources/bin/ (getFfmpegPath checks there
// first). This avoids resolving ffmpeg through app.asar.unpacked, which
// is the fragile path for portable builds that extract to a temp folder.
const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'bin');
fs.mkdirSync(binDir, { recursive: true });

function copyBinary(src, destName) {
  if (!src || !fs.existsSync(src)) {
    throw new Error(`Source binary not found: ${src}`);
  }
  const dest = path.join(binDir, destName);
  if (fs.existsSync(dest) && fs.statSync(dest).size === fs.statSync(src).size) {
    console.log(`  ${destName} already up to date`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`  ${destName} (${Math.round(fs.statSync(dest).size / 1e6)} MB)`);
}

console.log('Bundling binaries into bin/');
copyBinary(require('ffmpeg-static'), 'ffmpeg.exe');
