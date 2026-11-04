// One-time structural migration of the new screens; never touches legacy user screens.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const file = 'src/features/learning/screens.tsx';
const text = fs.readFileSync(file, 'utf8');
if (!text.includes('export function HomeScreen')) process.exit(0);
const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = new Map(source.statements.filter(ts.isFunctionDeclaration).map(n => [n.name.text, n.getText(source)]));
const imports = source.statements.filter(ts.isImportDeclaration);
function write(target, names, extras = '') {
  const body = names.map(n => functions.get(n)).join('\n\n');
  const nodes = ts.createSourceFile('body.tsx', body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const used = new Set();
  function visit(n) { if (ts.isIdentifier(n)) used.add(n.text); ts.forEachChild(n, visit); } visit(nodes);
  const lines = [];
  for (const imp of imports) {
    const mod = imp.moduleSpecifier.text;
    const clause = imp.importClause;
    const specs = clause?.namedBindings?.elements?.filter(n => used.has(n.name.text)).map(n => n.getText(source)) || [];
    const def = clause?.name && used.has(clause.name.text) ? clause.name.text : '';
    if (!def && !specs.length) continue;
    const resolved = mod === './hooks' ? '@/shared/data/hooks' : mod === './StudentProfile' ? '@/features/students/StudentProfile' : mod;
    lines.push(`import ${clause.isTypeOnly ? 'type ' : ''}${[def, specs.length ? '{ ' + specs.join(', ') + ' }' : ''].filter(Boolean).join(', ')} from '${resolved}';`);
  }
  if (used.has('Props')) lines.push("import type { ScreenProps as Props } from '@/app/routes';");
  if (used.has('LoadState') || used.has('SaveState')) lines.push(`import { ${['LoadState', 'SaveState'].filter(n => used.has(n)).join(', ')} } from '@/shared/ui/ResourceState';`);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, lines.join('\n') + '\n' + extras + '\n' + body + '\n');
}
const plan = {
  'src/features/students/screens.tsx': ['HomeScreen', 'StudentScreen', 'LinksScreen'],
  'src/features/assessments/AssessmentScreen.tsx': ['AssessmentScreen'],
  'src/features/activities/screens.tsx': ['ObservationScreen', 'ExecuteScreen'],
  'src/features/trails/TrailScreen.tsx': ['TrailScreen'],
  'src/features/reports/screens.tsx': ['HistoryScreen', 'ReportScreen'],
  'src/features/analysis/AnalysisScreen.tsx': ['AnalysisScreen'],
};
for (const [target, names] of Object.entries(plan)) write(target, names, names.includes('LinksScreen') ? "type Grant = { id: string; adult_id: string; role: string; active: boolean };" : '');
const routeNode = source.statements.find(n => ts.isTypeAliasDeclaration(n) && n.name.text === 'Routes');
fs.writeFileSync('src/app/routes.ts', "import type { Student, Assignment } from '@/shared/contracts';\nimport type { NativeStackScreenProps } from '@react-navigation/native-stack';\n" + routeNode.getText(source) + '\nexport type ScreenProps<K extends keyof Routes> = NativeStackScreenProps<Routes, K>;\n');
fs.mkdirSync('src/shared/data', {recursive: true});
fs.copyFileSync('src/features/learning/hooks.ts', 'src/shared/data/hooks.ts');
fs.writeFileSync('src/features/learning/hooks.ts', "export {useResource, useCommand} from '@/shared/data/hooks';\n");
fs.writeFileSync(file, Object.entries(plan).map(([p, names]) => `export {${names.join(', ')}} from '@/${p.slice(4, -4)}';`).join('\n') + "\nexport type { Routes } from '@/app/routes';\n");
const shared = ['LoadState', 'SaveState'].map(n => functions.get(n).replace(/^function /, 'export function ')).join('\n');
fs.writeFileSync('src/shared/ui/ResourceState.tsx', "import React from 'react';\nimport {Loading, Stack, Notice, Action} from '@/shared/ui';\nimport {useCommand} from '@/shared/data/hooks';\n" + shared + '\n');
fs.mkdirSync('src/features/students', {recursive: true});
fs.writeFileSync('src/features/students/StudentProfile.tsx', fs.readFileSync('src/features/learning/StudentProfile.tsx', 'utf8').replace("from './hooks'", "from '@/shared/data/hooks'"));
fs.writeFileSync('src/features/learning/StudentProfile.tsx', "export {StudentProfile} from '@/features/students/StudentProfile';\n");
