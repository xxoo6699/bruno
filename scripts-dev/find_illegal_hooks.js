const parser = require('@babel/parser');
const fs = require('fs');

const files = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const results = [];
const HOOK_RE = /^use[A-Z]/;

function annotateVarDecls(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) {
      if (d.init && (d.init.type === 'FunctionExpression' || d.init.type === 'ArrowFunctionExpression') && d.id && d.id.name) {
        d.init.__varName = d.id.name;
      }
    }
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const v = node[key];
    if (v && typeof v.type === 'string') annotateVarDecls(v);
    else if (Array.isArray(v)) v.forEach((x) => x && typeof x.type === 'string' && annotateVarDecls(x));
  }
}

function stackStr(stack) {
  return stack.map((s) => s.name || '(anon)').join(' > ');
}

// Walk a function body; flags hook calls that are illegal relative to `stack`:
// - inside anonymous callbacks (map/forEach/event handlers): callback-hook
// - inside lowercase named helpers: lowercase-helper-hook
function walkFnBody(bodyNode, stack, file) {
  if (!bodyNode) return;
  const top = stack[stack.length - 1];
  const queue = [bodyNode];
  while (queue.length) {
    const n = queue.pop();
    if (n.type === 'CallExpression') {
      let nm = null;
      if (n.callee.type === 'Identifier') nm = n.callee.name;
      else if (n.callee.type === 'MemberExpression' && n.callee.property.type === 'Identifier') nm = n.callee.property.name;
      if (nm && HOOK_RE.test(nm)) {
        if (top.isCallback) {
          results.push({ file, line: n.loc.start.line, kind: 'callback-hook', fn: stackStr(stack), hook: nm });
        } else if (top.name && !top.isComponent && !top.isCustomHook && /^[a-z]/.test(top.name)) {
          results.push({ file, line: n.loc.start.line, kind: 'lowercase-helper-hook', fn: top.name, hook: nm });
        }
      }
    }
    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      const v = n[key];
      if (v && typeof v.type === 'string') {
        if (v.type === 'FunctionDeclaration' || v.type === 'FunctionExpression' || v.type === 'ArrowFunctionExpression') {
          walk(v, stack, file);
        } else {
          queue.push(v);
        }
      } else if (Array.isArray(v)) {
        v.forEach((x) => x && typeof x.type === 'string' && queue.push(x));
      }
    }
  }
}

const WRAPPER_CALLEES = new Set(['forwardRef', 'memo', 'observer', 'withTranslation', 'withTheme', 'withRouter', 'hot']);

function walk(node, stack, file) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    const name = (node.id && node.id.name) || node.__varName || null;
    // anonymous fn passed to forwardRef/memo/etc. is still a component
    let wrappedByComponentHelper = false;
    if (!name && node.__wrapperCallee && WRAPPER_CALLEES.has(node.__wrapperCallee)) {
      wrappedByComponentHelper = true;
    }
    const entry = {
      name,
      isComponent: (name ? /^[A-Z]/.test(name) : false) || wrappedByComponentHelper,
      isCustomHook: name ? HOOK_RE.test(name) : false,
      isCallback: !name && !wrappedByComponentHelper
    };
    walkFnBody(node.body, [...stack, entry], file);
    return;
  }
  // annotate anonymous fns passed to known component wrappers
  if (node.type === 'CallExpression' && node.callee) {
    let cn = null;
    if (node.callee.type === 'Identifier') cn = node.callee.name;
    else if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') cn = node.callee.property.name;
    if (cn && WRAPPER_CALLEES.has(cn)) {
      for (const a of node.arguments) {
        if (a && (a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression')) {
          a.__wrapperCallee = cn;
        }
      }
    }
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const v = node[key];
    if (v && typeof v.type === 'string') walk(v, stack, file);
    else if (Array.isArray(v)) v.forEach((x) => x && typeof x.type === 'string' && walk(x, stack, file));
  }
}

for (const file of files) {
  try {
    const ast = parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    annotateVarDecls(ast.program);
    walk(ast.program, [], file);
  } catch (e) {
    results.push({ file, parseError: e.message });
  }
}
console.log(JSON.stringify(results));
