import { readFileSync } from 'fs';
import * as pdfjsLib from './node_modules/pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).pathname;

const data = readFileSync('./Lorian of Catarina.pdf');
const doc = await pdfjsLib.getDocument({ data: new Uint8Array(data), disableWorker: true }).promise;

const numPages = doc.numPages;
const allFields = [];
for (let p = 1; p <= numPages; p++) {
  const page = await doc.getPage(p);
  const annotations = await page.getAnnotations();
  annotations
    .filter(a => a.fieldName && a.subtype === 'Widget')
    .forEach(a => allFields.push({ name: a.fieldName, value: a.fieldValue, page: p }));
}

console.log('=== ALL NON-EMPTY FIELDS ===');
allFields.forEach(f => {
  if (f.value !== '' && f.value !== undefined && f.value !== null && f.value !== 'Off') {
    console.log(`[p${f.page}] ${JSON.stringify(f.name)} = ${JSON.stringify(f.value)}`);
  }
});
