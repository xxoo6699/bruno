import React from 'react';
import { useTranslation } from 'react-i18next';
import StyledWrapper from './StyledWrapper';

const StorageStep = ({ collectionLocation, onBrowse }) => {
  const { t } = useTranslation();
  return (
    <StyledWrapper className="step-body">
      <div className="step-label">{t('Storage')}</div>
      <div className="step-title">{t('Where should we store your collections?')}</div>
      <div className="step-description">
        {t('Bruno saves collections as plain files on your filesystem, perfect for version control with Git.')}
      </div>

      <div className="location-input-group">
        <div
          className="location-path-display"
          onClick={onBrowse}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBrowse();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {collectionLocation ? (
            <span className="path-text">{collectionLocation}</span>
          ) : (
            <span className="path-text path-placeholder">{t('Click to choose a folder...')}</span>
          )}
          <span className="browse-label">{t('Browse')}</span>
        </div>
      </div>
      <div className="location-hint">
        {t('Each collection and workspace gets its own folder inside this directory. You can change this later.')}
      </div>
    </StyledWrapper>
  );
};

export default StorageStep;
