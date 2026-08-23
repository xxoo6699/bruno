const { ipcMain } = require('electron');
const os = require('os');
const { BrowserWindow } = require('electron');
const { version } = require('../../package.json');
const aboutBruno = require('./about-bruno');

const translations = {
  'en': {
    collection: 'Collection',
    openCollection: 'Open Collection',
    openRecent: 'Open Recent',
    clearRecent: 'Clear Recent',
    quit: 'Quit',
    forceQuit: 'Force Quit',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    hide: 'Hide Bruno',
    hideOthers: 'Hide Others',
    view: 'View',
    actualSize: 'Actual Size',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    window: 'Window',
    minimize: 'Minimize',
    close: 'Close',
    help: 'Help',
    aboutBruno: 'About Bruno',
    documentation: 'Documentation'
  },
  'zh-CN': {
    collection: '集合',
    openCollection: '打开集合',
    openRecent: '打开最近使用',
    clearRecent: '清除最近记录',
    quit: '退出',
    forceQuit: '强制退出',
    edit: '编辑',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    hide: '隐藏 Bruno',
    hideOthers: '隐藏其他',
    view: '显示',
    actualSize: '实际大小',
    zoomIn: '放大',
    zoomOut: '缩小',
    window: '窗口',
    minimize: '最小化',
    close: '关闭窗口',
    help: '帮助',
    aboutBruno: '关于 Bruno',
    documentation: '文档'
  }
};

// locale comes from preferences (general.locale); falls back to English
module.exports = function buildMenuTemplate(locale) {
  const t = translations[locale] || translations.en;

  return [
    {
      label: t.collection,
      submenu: [
        {
          label: t.openCollection,
          click() {
            ipcMain.emit('menu:open-collection');
          }
        },
        {
          label: t.openRecent,
          role: 'recentdocuments',
          visible: os.platform() == 'darwin',
          submenu: [
            {
              label: t.clearRecent,
              role: 'clearrecentdocuments'
            }
          ]
        },
        { type: 'separator' },
        {
          label: t.quit,
          click() {
            ipcMain.emit('main:start-quit-flow');
          }
        },
        {
          label: t.forceQuit,
          click() {
            process.exit();
          }
        }
      ]
    },
    {
      label: t.edit,
      submenu: [
        { role: 'undo', label: t.undo },
        { role: 'redo', label: t.redo },
        { type: 'separator' },
        { role: 'cut', label: t.cut },
        { role: 'copy', label: t.copy },
        { role: 'paste', label: t.paste },
        { role: 'selectAll', label: t.selectAll },
        { type: 'separator' },
        { role: 'hide', label: t.hide },
        { role: 'hideOthers', label: t.hideOthers }
      ]
    },
    {
      label: t.view,
      submenu: [
        { role: 'toggledevtools' },
        { type: 'separator' },
        {
          label: t.actualSize,
          accelerator: 'CommandOrControl+0',
          registerAccelerator: false,
          click() {
            ipcMain.emit('menu:reset-zoom');
          }
        },
        {
          label: t.zoomIn,
          accelerator: 'CommandOrControl+Plus',
          registerAccelerator: false,
          click() {
            ipcMain.emit('menu:zoom-in');
          }
        },
        {
          label: t.zoomOut,
          accelerator: 'CommandOrControl+-',
          registerAccelerator: false,
          click() {
            ipcMain.emit('menu:zoom-out');
          }
        },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      label: t.window,
      submenu: [{ role: 'minimize', label: t.minimize }, { role: 'close', accelerator: 'CommandOrControl+Shift+Q', label: t.close }]
    },
    {
      role: 'help',
      label: t.help,
      submenu: [
        {
          label: t.aboutBruno,
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 350,
              height: 250,
              webPreferences: {
                nodeIntegration: true
              }
            });
            aboutWindow.removeMenu();
            aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(aboutBruno({ version, locale }))}`);
          }
        },
        { label: t.documentation, click: () => ipcMain.emit('main:open-docs') }
      ]
    }
  ];
};
