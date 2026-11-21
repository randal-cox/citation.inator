// Local-only independent challenge evaluation. Failing targets remain in the report.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {evaluateImportCases} from '../src/import-evaluation.mjs';
const bytes=await readFile(new URL('../test/fixtures/import-challenge.json',import.meta.url));
const report={...evaluateImportCases(JSON.parse(bytes)),fixtureSha256:createHash('sha256').update(bytes).digest('hex')};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
