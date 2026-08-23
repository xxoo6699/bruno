import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconMenu2 } from '@tabler/icons';
import MenuDropdown from 'ui/MenuDropdown';
import ActionIcon from 'ui/ActionIcon';
import StyledWrapper from './StyledWrapper';

const AppMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { ipcRenderer } = window;

  const menuItems = [
    {
      id: 'file',
      label: t('File'),
      submenu: [
        {
          id: 'open-collection',
          label: t('Open Collection'),
          onClick: () => ipcRenderer?.send('renderer:open-collection')
        },
        { type: 'divider', id: 'file-div-1' },
        {
          id: 'preferences',
          label: t('Preferences'),
          rightSection: <span className="shortcut">{t('Ctrl+,')}</span>,
          onClick: () => ipcRenderer?.invoke('renderer:open-preferences')
        },
        { type: 'divider', id: 'file-div-2' },
        {
          id: 'quit',
          label: t('Quit'),
          rightSection: <span className="shortcut">{t('Alt+F4')}</span>,
          onClick: () => ipcRenderer?.send('renderer:window-close')
        }
      ]
    },
    {
      id: 'edit',
      label: t('Edit'),
      submenu: [
        {
          id: 'undo',
          label: t('Undo'),
          rightSection: <span className="shortcut">{t('Ctrl+Z')}</span>,
          onClick: () => document.execCommand('undo')
        },
        {
          id: 'redo',
          label: t('Redo'),
          rightSection: <span className="shortcut">{t('Ctrl+Y')}</span>,
          onClick: () => document.execCommand('redo')
        },
        { type: 'divider', id: 'edit-div-1' },
        {
          id: 'cut',
          label: t('Cut'),
          rightSection: <span className="shortcut">{t('Ctrl+X')}</span>,
          onClick: () => document.execCommand('cut')
        },
        {
          id: 'copy',
          label: t('Copy'),
          rightSection: <span className="shortcut">{t('Ctrl+C')}</span>,
          onClick: () => document.execCommand('copy')
        },
        {
          id: 'paste',
          label: t('Paste'),
          rightSection: <span className="shortcut">{t('Ctrl+V')}</span>,
          onClick: () => document.execCommand('paste')
        },
        { type: 'divider', id: 'edit-div-2' },
        {
          id: 'select-all',
          label: t('Select All'),
          rightSection: <span className="shortcut">{t('Ctrl+A')}</span>,
          onClick: () => document.execCommand('selectAll')
        }
      ]
    },
    {
      id: 'view',
      label: t('View'),
      submenu: [
        {
          id: 'toggle-devtools',
          label: t('Developer Tools'),
          rightSection: <span className="shortcut">{t('Ctrl+Shift+I')}</span>,
          onClick: () => ipcRenderer?.invoke('renderer:toggle-devtools')
        },
        { type: 'divider', id: 'view-div-1' },
        {
          id: 'reset-zoom',
          label: t('Reset Zoom'),
          rightSection: <span className="shortcut">{t('Ctrl+0')}</span>,
          onClick: () => ipcRenderer?.invoke('renderer:reset-zoom')
        },
        {
          id: 'zoom-in',
          label: t('Zoom In'),
          rightSection: <span className="shortcut">{t('Ctrl++')}</span>,
          onClick: () => ipcRenderer?.invoke('renderer:zoom-in')
        },
        {
          id: 'zoom-out',
          label: t('Zoom Out'),
          rightSection: <span className="shortcut">{t('Ctrl+-')}</span>,
          onClick: () => ipcRenderer?.invoke('renderer:zoom-out')
        },
        { type: 'divider', id: 'view-div-2' },
        {
          id: 'toggle-fullscreen',
          label: t('Full Screen'),
          rightSection: <span className="shortcut">F11</span>,
          onClick: () => ipcRenderer?.invoke('renderer:toggle-fullscreen')
        }
      ]
    },
    {
      id: 'help',
      label: t('Help'),
      submenu: [
        {
          id: 'about',
          label: t('About Bruno'),
          onClick: () => ipcRenderer?.invoke('renderer:open-about')
        },
        {
          id: 'documentation',
          label: t('Documentation'),
          onClick: () => ipcRenderer?.invoke('renderer:open-docs')
        }
      ]
    }
  ];

  return (
    <StyledWrapper>
      <MenuDropdown
        opened={isOpen}
        onChange={setIsOpen}
        placement="bottom-start"
        showTickMark={false}
        items={menuItems}
      >
        <ActionIcon label={t('Menu')} size="lg">
          <IconMenu2 size={16} stroke={1.5} />
        </ActionIcon>
      </MenuDropdown>
    </StyledWrapper>
  );
};

export default AppMenu;
