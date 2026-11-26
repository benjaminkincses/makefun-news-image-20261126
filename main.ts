import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const programDirectory = fileURLToPath(new URL('.', import.meta.url));
const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));
const outputDirectory = resolve(programDirectory, process.env.MAKEFUN_OUTPUT_DIR || './output');
const copyPath = join(outputDirectory, 'entry.png');

await mkdir(outputDirectory, { recursive: true });
const source = await readFile(sourcePath);
await writeFile(copyPath, source);
const copy = await stat(copyPath);
console.log(`Source: ${source.length} bytes`);
console.log(`Copy: ${copy.size} bytes`);
if (source.length !== copy.size) process.exitCode = 1;

const copiedBytes = await readFile(copyPath);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
if (copiedBytes.subarray(0, 8).equals(pngSignature)) {
  console.log('format: png');
} else if (copiedBytes.subarray(0, 3).equals(jpegSignature)) {
  console.log('format: jpeg');
} else {
  console.log('format: unknown');
  process.exitCode = 1;
}
console.log(`sha256: ${createHash('sha256').update(copiedBytes).digest('hex')}`);
