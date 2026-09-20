import fs from 'node:fs';
import ts from 'typescript';
const source = ts.createSourceFile('AppRouter.tsx', fs.readFileSync(new URL('../src/routes/AppRouter.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
export const routeFamilies = { public: [], resident: [], professional: [], partner: [], shared: [], internal: [] };
function visit(node, inherited = 'public') {
  let family = inherited;
  const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  if (opening?.tagName.getText(source) === 'Route') {
    const attrs = opening.attributes.properties;
    const element = attrs.find(a => ts.isJsxAttribute(a) && a.name.getText(source) === 'element')?.initializer?.getText(source) || '';
    if (element.includes('ProtectedLayout')) family = 'shared';
    if (element.includes('WorkspaceLayout')) family = 'internal';
    for (const audience of ['resident', 'professional', 'partner']) if (element.includes(`audience="${audience}"`)) family = audience;
    const route = attrs.find(a => ts.isJsxAttribute(a) && a.name.getText(source) === 'path')?.initializer;
    if (route && ts.isStringLiteral(route)) routeFamilies[family].push(route.text);
  }
  // Opening elements have already been processed through their parent JsxElement.
  ts.forEachChild(node, child => { if (!ts.isJsxOpeningElement(child)) visit(child, family); });
}
visit(source);
