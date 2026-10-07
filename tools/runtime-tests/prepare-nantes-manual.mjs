// Compatibility executable/import path; canonical Brittany helper.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './contracts/brittany_missions/prepare-nantes-manual.mjs';
export { main };
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();
