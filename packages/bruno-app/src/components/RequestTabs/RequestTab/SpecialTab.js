import React from 'react';
import { useTranslation } from 'react-i18next';
import GradientCloseButton from './GradientCloseButton';
import StatusBadge from 'ui/StatusBadge';
import { IconVariable, IconSettings, IconRun, IconFolder, IconDatabase, IconWorld, IconHome, IconFileCode, IconConfetti, IconServer2 } from '@tabler/icons';
import OpenAPISyncIcon from 'components/Icons/OpenAPISync';

const SpecialTab = ({ handleCloseClick, type, tabName, handleDoubleClick, hasDraft }) => {
  const { t } = useTranslation();
  const getTabInfo = (type, tabName) => {
    switch (type) {
      case 'collection-settings': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Collection')}</span>
          </>
        );
      }
      case 'collection-overview': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Overview')}</span>
          </>
        );
      }
      case 'folder-settings': {
        return (
          <>
            <IconFolder size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{tabName || t('Folder')}</span>
          </>
        );
      }
      case 'variables': {
        return (
          <>
            <IconVariable size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Variables')}</span>
          </>
        );
      }
      case 'collection-runner': {
        return (
          <>
            <IconRun size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Runner')}</span>
          </>
        );
      }
      case 'environment-settings': {
        return (
          <>
            <IconDatabase size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Environments')}</span>
          </>
        );
      }
      case 'global-environment-settings': {
        return (
          <>
            <IconWorld size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Global Environments')}</span>
          </>
        );
      }
      case 'preferences': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Preferences')}</span>
          </>
        );
      }
      case 'workspaceOverview': {
        return (
          <>
            <IconHome size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Overview')}</span>
          </>
        );
      }
      case 'workspaceEnvironments': {
        return (
          <>
            <IconWorld size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('Environments')}</span>
          </>
        );
      }
      case 'openapi-sync': {
        return (
          <>
            <OpenAPISyncIcon size={14} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name mr-1">OpenAPI</span>
          </>
        );
      }
      case 'openapi-spec': {
        return (
          <>
            <IconFileCode size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('API Spec')}</span>
          </>
        );
      }
      case 'mock-server': {
        return (
          <>
            <IconServer2 size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name mr-1">{tabName || t('Mock Server')}</span>
            <StatusBadge status="info" size="xs">{t('Beta')}</StatusBadge>
          </>
        );
      }
      case 'changelog': {
        return (
          <>
            <IconConfetti size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{t('What\'s New')}</span>
          </>
        );
      }
    }
  };

  return (
    <>
      <div
        className="flex items-center tab-label"
        onDoubleClick={handleDoubleClick}
      >
        {getTabInfo(type, tabName)}
      </div>

      <GradientCloseButton hasChanges={hasDraft} onClick={handleCloseClick} />
    </>
  );
};

export default SpecialTab;
