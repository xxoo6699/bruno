#!/usr/bin/env python3
"""Find hooks called after an early return in the same function body (React #300 cause).
Uses @babel/parser via node for accurate parsing."""
import json, os, subprocess

APP = '/Users/xts/00aProjects/bruno/packages/bruno-app'

NODE_SCRIPT = r'''
const parser = require('@babel/parser');
const fs = require('fs');

const files = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const results = [];

function walk(node, ctx) {
  // detect function-like nodes
  if (!node || typeof node.type !== 'string') return;
  const isFn = ['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression','ObjectMethod','ClassMethod'].includes(node.type);
  if (isFn) {
    const name = fnName(node);
    const body = node.body;
    if (body && body.type === 'BlockStatement') {
      const hooksInBody = [];
      let earlyReturnBeforeHook = null;
      let depthEarlyReturn = null;
      scanBody(body.body, node, name, results, ctx);
    }
    // recurse into params defaults etc.
    for (const key of Object.keys(node)) {
      if (key === 'body' || key === 'id' || key === 'params') continue;
      const v = node[key];
      if (v && typeof v.type === 'string') walk(v, ctx);
      else if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && walk(x, ctx));
    }
    if (node.body && node.body.type !== 'BlockStatement') {
      walk(node.body, ctx);
    }
    return;
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const v = node[key];
    if (v && typeof v.type === 'string') walk(v, ctx);
    else if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && walk(x, ctx));
  }
}

function fnName(node) {
  if (node.id && node.id.name) return node.id.name;
  if (node.type === 'FunctionDeclaration' && node.id) return node.id.name;
  return null; // caller enriches from parent variable decl when needed
}

// scan statements of a function body in order; report hooks that appear after
// a top-level `return` statement, or inside conditional blocks while absent otherwise.
function scanBody(stmts, fnNode, fname, results, ctx) {
  let returned = false;
  for (const st of stmts) {
    const hooksHere = collectHookCalls(st, []);
    if (returned && hooksHere.length > 0) {
      results.push({ file: ctx.file, line: st.loc.start.line, fn: fname || '(anon)', reason: 'after-return', stmt: srcLine(st) });
    }
    if (st.type === 'ReturnStatement') returned = true;

    // hooks inside IfStatement branches: flag only when the same hook does not
    // also exist unconditionally — approximate: flag hooks directly inside if bodies
    if (st.type === 'IfStatement') {
      const inBranches = [];
      collectHookCalls(st.consequent, inBranches);
      if (st.alternate) collectHookCalls(st.alternate, inBranches);
      for (const h of inBranches) {
        results.push({ file: ctx.file, line: h.line, fn: fname || '(anon)', reason: 'inside-if', stmt: h.text });
      }
    }
    // recurse into children statements (nested functions handled by walk)
    for (const key of Object.keys(st)) {
      const v = st[key];
      if (v && typeof v.type === 'string' && !['Identifier','JSXText'].includes(v.type)) walkNested(v, ctx);
      else if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && !['Identifier','JSXText'].includes(x.type) && walkNested(x, ctx));
    }
  }
}

function walkNested(node, ctx) {
  if (['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(node.type)) {
    walk(node, ctx); // separate scan context for nested fns
    return;
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const v = node[key];
    if (v && typeof v.type === 'string') walkNested(v, ctx);
    else if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && walkNested(x, ctx));
  }
}

function collectHookCalls(node, acc) {
  if (!node || typeof node.type !== 'string') return acc;
  if (node.type === 'CallExpression') {
    const callee = node.callee;
    let nm = null;
    if (callee.type === 'Identifier') nm = callee.name;
    if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') nm = callee.property.name;
    if (nm && /^use[A-Z]/.test(nm)) {
      acc.push({ line: node.loc.start.line, text: nm });
    }
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const v = node[key];
    if (v && typeof v.type === 'string') collectHookCalls(v, acc);
    else if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && collectHookCalls(x, acc));
  }
  return acc;
}

for (const file of files) {
  let ast;
  try {
    ast = parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'], errorRecovery: false });
  } catch (e) {
    results.push({ file, parseError: e.message });
    continue;
  }
  walk(ast.program, { file });
}
console.log(JSON.stringify(results, null, 1));
'''

with open('/tmp/find_hooks.js', 'w') as f:
    f.write(NODE_SCRIPT)

file_list = []
for sub in ['src/components', 'src/pages', 'src/providers', 'src/ui']:
    for dirpath, dirnames, filenames in os.walk(os.path.join(APP, sub)):
        dirnames[:] = [d for d in dirnames if d != 'node_modules']
        for fn in filenames:
            if fn.endswith('.js') and not fn.endswith(('.spec.js', '.test.js')):
                file_list.append(os.path.join(dirpath, fn))

with open('/tmp/hook_scan_files.json', 'w') as f:
    json.dump(file_list, f)

out = subprocess.run(['node', '/tmp/find_hooks.js', '/tmp/hook_scan_files.json'],
                     capture_output=True, text=True, cwd=APP + '/..')
if out.returncode != 0:
    print('STDERR:', out.stderr[:2000])
else:
    res = json.loads(out.stdout)
    real = [r for r in res if 'reason' in r]
    print('findings:', len(real))
    for r in real:
        print(f"{r['file'].split('packages/bruno-app/')[-1]}:{r['line']} [{r['reason']}] {r['fn']} :: {r['stmt'][:80]}")
    perr = [r for r in res if 'parseError' in r]
    for p in perr:
        print('PARSE:', p['file'], p['parseError'][:100])
