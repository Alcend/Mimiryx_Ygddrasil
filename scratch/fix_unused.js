import { execSync } from 'child_process';
import fs from 'fs';

function fixUnused() {
  console.log('Running tsc...');
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8' });
    console.log('No errors found!');
    return;
  } catch (err) {
    const output = err.stdout;
    const regex = /^(src\/[^:]+)\((\d+),\d+\): error TS6133: '([^']+)' is declared but its value is never read\./gm;
    const removals = {};

    let match;
    while ((match = regex.exec(output)) !== null) {
      const file = match[1];
      const line = parseInt(match[2], 10);
      const symbol = match[3];

      if (!removals[file]) removals[file] = [];
      removals[file].push({ line, symbol });
    }

    for (const [file, items] of Object.entries(removals)) {
      console.log(`Fixing ${file}...`);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Sort descending to not mess up line numbers when deleting
      items.sort((a, b) => b.line - a.line);

      for (const { line, symbol } of items) {
        let idx = line - 1;
        let l = lines[idx];

        if (l.includes('import') || l.includes('from') || l.includes('{')) {
          // Remove symbol from import
          let nextL = l;
          nextL = nextL.replace(new RegExp(`,\\s*\\b${symbol}\\b`), '');
          if (nextL === l) nextL = nextL.replace(new RegExp(`\\b${symbol}\\b\\s*,`), '');
          if (nextL === l) nextL = nextL.replace(new RegExp(`\\b${symbol}\\b`), '');

          // if empty brackets, remove line
          if (nextL.match(/\{\s*\}/)) nextL = '';
          if (nextL.includes('import') && !nextL.includes('{') && nextL.includes('from') && nextL.trim().startsWith('import from')) nextL = '';

          lines[idx] = nextL;
        }
      }

      fs.writeFileSync(file, lines.join('\n'), 'utf8');
    }
  }
}

fixUnused();
