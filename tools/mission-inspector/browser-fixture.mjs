// Always regenerate source-backed browser input in a unique ignored fixture root.
// No production report or baseline is read as a browser test fixture.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {generate} from './generate.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
export function prepareBrowserFixture({noVanilla=false}={}) {
  const fixture=path.join(here,'test-work','browser-'+crypto.randomUUID());
  fs.mkdirSync(fixture,{recursive:true});
  const generated=generate('brittany_missions',noVanilla,{storage:path.join(fixture,'reports'),storageNamespace:'browser-brittany',artifactKind:'fixture'});
  return {fixture,output:path.join(generated.output,'index.html'),identity:generated.identity};
}
