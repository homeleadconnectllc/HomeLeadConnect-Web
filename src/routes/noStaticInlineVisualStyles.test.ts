import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import path from "node:path";

const runtimeProperties: Record<string, string[]> = {
  "src/components/analytics/AnalyticsKpis.tsx": ["width"],
  "src/components/GlobalPullToRefresh.tsx": ["--hlc-pull-distance", "--hlc-pull-progress"],
  "src/components/agents/AgentChatPanel.tsx": ["--chat-agent-accent"],
  "src/components/leads/LeadCard.tsx": ["--lead-accent"],
  "src/pages/dashboard/CommunityMatchDeck.tsx": ["transform"],
  "src/pages/dashboard/IntelligenceWorkspace.tsx": ["width"],
  "src/pages/dashboard/ProviderMap.tsx": ["--record-accent", "left", "top"],
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx$/.test(file) ? [file] : [];
  });
}

function unwrap(node: ts.Expression): ts.Expression {
  return ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node) ? unwrap(node.expression) : node;
}

test("repository-wide JSX styles contain only reviewed runtime properties", () => {
  for (const file of sourceFiles("src")) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node) => {
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "style") {
        const allowed = runtimeProperties[file];
        assert.ok(allowed, `${file}: unreviewed inline style`);
        assert.ok(node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression);
        let expression = unwrap(node.initializer.expression);
        if (ts.isIdentifier(expression)) {
          const name = expression.text;
          // Find the nearest lexical declaration, including map callback locals.
          let scope: ts.Node | undefined = node.parent;
          let resolved: ts.Expression | undefined;
          while (scope && !resolved) {
            const inspect = (candidate: ts.Node) => {
              if (ts.isVariableDeclaration(candidate) && candidate.name.getText(source) === name && candidate.initializer) resolved = candidate.initializer;
              if (!resolved) ts.forEachChild(candidate, inspect);
            };
            inspect(scope);
            scope = scope.parent;
          }
          assert.ok(resolved, `${file}: unresolved style ${name}`);
          expression = unwrap(resolved);
        }
        assert.ok(ts.isObjectLiteralExpression(expression), `${file}: styles must be inspectable objects`);
        for (const property of expression.properties) {
          assert.ok(ts.isPropertyAssignment(property), `${file}: no style spreads`);
          const key = property.name.getText(source).replace(/^['"]|['"]$/g, "");
          assert.ok(allowed.includes(key), `${file}: unreviewed runtime property ${key}`);
          assert.ok(!ts.isStringLiteral(property.initializer) && !ts.isNumericLiteral(property.initializer), `${file}: static ${key} belongs in CSS`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});

test("public shared navigation does not inject a second static stylesheet", () => {
  const source = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
  assert.doesNotMatch(source, /setImportant|createElement\(["']style["']\)|ownerVisualStyle/);
});
