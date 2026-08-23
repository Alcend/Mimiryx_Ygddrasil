import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Insert imports
content = content.replace(
  "import { sounds } from '../utils/audio';",
  "import { sounds } from '../utils/audio';\nimport { SystemLogs } from '../components/dashboard/SystemLogs';\nimport { KnowledgeDistribution } from '../components/dashboard/KnowledgeDistribution';"
);

// Replace the two large sections with the components
// They are wrapped inside activeSideTab conditions
const sysLogsRegex = /\{\/\* System Logs \(Visual Fluff\) \*\/\}[\s\S]*?\{\/\* Knowledge Flow State & Mastery \(from Analytics\) \*\/\}/;
content = content.replace(sysLogsRegex, `
            {/* System Logs (Visual Fluff) */}
            {(activeSideTab === 'all' || activeSideTab === 'logs') && (
              <SystemLogs />
            )}

            {/* Knowledge Flow State & Mastery (from Analytics) */}
`);

const knowledgeDistRegex = /\{\/\* Knowledge Flow State & Mastery \(from Analytics\) \*\/\}[\s\S]*?\{\/\* Progress by Topic list \*\/\}/;
// Actually, it's easier to replace the entire Knowledge Distribution block
const fullDistRegex = /\{\/\* Knowledge Flow State & Mastery \(from Analytics\) \*\/\}[\s\S]*?\}\)\}\s*<\/div>\s*<\/div>\s*\{\/\* Streak Badge \*\/\}/;
// Since Regex is tricky, let's just use replace on the whole block

fs.writeFileSync('src/pages/Dashboard.tsx', content);
