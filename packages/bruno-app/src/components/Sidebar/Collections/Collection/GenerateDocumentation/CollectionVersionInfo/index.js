import React, { memo, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

const CollectionVersionInfo = ({ name, version, folderCount = 0, requestCount = 0, environmentCount = 0 }) => {
  const { t } = useTranslation();
  const folderLabel = folderCount === 1 ? t('Folder') : t('Folders');
  const requestLabel = requestCount === 1 ? t('request') : t('requests');

  return (
    <div className="version-info" data-testid="version-info">
      <div className="version-line">
        <span className="collection-name" data-testid="collection-name">{name}</span>
        <span className="version-value" data-testid="version-value">{t('Version: {{version}}', { version: version || t('Not Set') })}</span>
      </div>
      <p className="version-summary" data-testid="version-summary">
        <span>{`${folderCount} ${folderLabel}`}</span>
        <span className="version-dot" aria-hidden="true" />
        <span>{`${requestCount} ${requestLabel}`}</span>
        {environmentCount === 0 ? (
          <Fragment>
            <span className="version-dot" aria-hidden="true" />
            <span>{t('0 environments')}</span>
          </Fragment>
        ) : null}
      </p>
    </div>
  );
};

export default memo(CollectionVersionInfo);
