import React, { useMemo, useCallback } from 'react';
import get from 'lodash/get';
import { IconCaretDown } from '@tabler/icons';
import MenuDropdown from 'ui/MenuDropdown';
import StatusBadge from 'ui/StatusBadge/index';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateRequestAuthMode } from 'providers/ReduxStore/slices/collections';
import { humanizeRequestAuthMode } from 'utils/collections';
import StyledWrapper from './StyledWrapper';

const AuthMode = ({ item, collection }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const authMode = item.draft ? get(item, 'draft.request.auth.mode') : get(item, 'request.auth.mode');

  const onModeChange = useCallback((value) => {
    dispatch(
      updateRequestAuthMode({
        itemUid: item.uid,
        collectionUid: collection.uid,
        mode: value
      })
    );
  }, [dispatch, item.uid, collection.uid]);

  const menuItems = useMemo(() => [
    {
      id: 'awsv4',
      label: t('AWS Sig v4'),
      onClick: () => onModeChange('awsv4')
    },
    {
      id: 'basic',
      label: t('Basic Auth'),
      onClick: () => onModeChange('basic')
    },
    {
      id: 'bearer',
      label: t('Bearer Token'),
      onClick: () => onModeChange('bearer')
    },
    {
      id: 'digest',
      label: t('Digest Auth'),
      onClick: () => onModeChange('digest')
    },
    {
      id: 'ntlm',
      label: t('NTLM Auth'),
      onClick: () => onModeChange('ntlm')
    },
    {
      id: 'oauth1',
      label: t('OAuth 1.0'),
      onClick: () => onModeChange('oauth1')
    },
    {
      id: 'oauth2',
      label: t('OAuth 2.0'),
      onClick: () => onModeChange('oauth2')
    },
    {
      id: 'wsse',
      label: t('WSSE Auth'),
      onClick: () => onModeChange('wsse')
    },
    {
      id: 'apikey',
      label: t('API Key'),
      onClick: () => onModeChange('apikey')
    },
    {
      id: 'akamai-edgegrid',
      label: (
        <span className="flex items-center gap-2">
          Akamai EdgeGrid
          <StatusBadge status="info" size="xs">{t('Beta')}</StatusBadge>
        </span>
      ),
      ariaLabel: t('Akamai EdgeGrid (Beta)'),
      onClick: () => onModeChange('akamai-edgegrid')
    },
    {
      id: 'inherit',
      label: t('Inherit'),
      onClick: () => onModeChange('inherit')
    },
    {
      id: 'none',
      label: t('No Auth'),
      onClick: () => onModeChange('none')
    }
  ], [onModeChange, t]);

  return (
    <StyledWrapper>
      <div className="inline-flex items-center cursor-pointer auth-mode-selector" data-testid="auth-mode-selector">
        <MenuDropdown
          items={menuItems}
          placement="bottom-end"
          selectedItemId={authMode}
          showTickMark={true}
          data-testid="auth-mode-dropdown"
        >
          <div className="flex items-center justify-center auth-mode-label select-none" data-testid="auth-mode-label">
            {humanizeRequestAuthMode(authMode)} <IconCaretDown className="caret ml-1" size={14} strokeWidth={2} />
          </div>
        </MenuDropdown>
      </div>
    </StyledWrapper>
  );
};
export default AuthMode;
