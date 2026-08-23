// Local build override for repackaging without Apple Developer signing.
// Extends electron-builder-config.js: disables code signing + notarization
// (no signing identity available) and targets dmg/zip for x64 + arm64.
// Linux / win sections are inherited unchanged from the base config.
// Usage: npx electron-builder --mac --config electron-builder-config.local.js
const base = require('./electron-builder-config.js');

base.afterSign = undefined;
base.mac.identity = null;
base.mac.notarize = false;
base.mac.hardenedRuntime = false;
base.mac.requirements = undefined;
base.mac.target = [
  { target: 'dmg', arch: ['x64', 'arm64'] },
  { target: 'zip', arch: ['x64', 'arm64'] }
];

module.exports = base;
