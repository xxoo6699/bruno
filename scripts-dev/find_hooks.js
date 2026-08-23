
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
