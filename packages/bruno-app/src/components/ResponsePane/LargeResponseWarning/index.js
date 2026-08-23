import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconDownload, IconCopy, IconEye, IconAlertTriangle } from '@tabler/icons';
import toast from 'react-hot-toast';
import get from 'lodash/get';
import StyledWrapper from './StyledWrapper';
import { formatSize } from 'utils/common/index';
import Button from 'ui/Button/index';

const LargeResponseWarning = ({ item, responseSize, onRevealResponse }) => {
  const { t } = useTranslation();
  const { ipcRenderer } = window;
  const response = item.response || {};

  const downloadResponseToFile = () => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('renderer:save-response-to-file', response, item.requestSent.url, item.pathname)
        .then((result) => {
          if (result && result.success) {
            toast.success(t('Response downloaded to file'));
          }
          resolve();
        })
        .catch((err) => {
          toast.error(get(err, 'error.message') || t('Something went wrong!'));
          reject(err);
        });
    });
  };

  const copyResponse = () => {
    try {
      const textToCopy = typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data, null, 2);

      navigator.clipboard.writeText(textToCopy).then(() => {
        toast.success(t('Response copied to clipboard'));
      }).catch(() => {
        toast.error(t('Failed to copy response'));
      });
    } catch (error) {
      toast.error(t('Failed to copy response'));
    }
  };

  return (
    <StyledWrapper>
      <div className="warning-container">
        <div className="warning-icon">
          <IconAlertTriangle size={45} strokeWidth={2} />
        </div>
        <div className="warning-content">
          <div className="warning-title">
            {t('Large Response Warning')}
          </div>
          <div className="warning-description">
            {t('Handling responses over')} <span className="size-highlight supported-size">{formatSize(10 * 1024 * 1024)}</span> {t('could degrade performance.')}
            <br />
            {t('Size of current response:')} <span className="size-highlight current-size">{formatSize(responseSize)}</span>
          </div>
        </div>
      </div>
      <div className="warning-actions">
        <Button
          icon={<IconEye size={18} strokeWidth={1.5} />}
          iconPosition="left"
          onClick={onRevealResponse}
          title={t('Show response content')}
          color="secondary"
          size="sm"
        >
          {t('View')}
        </Button>
        <Button
          icon={<IconDownload size={18} strokeWidth={1.5} />}
          iconPosition="left"
          onClick={downloadResponseToFile}
          disabled={!response.dataBuffer}
          title={t('Download response to file')}
          color="secondary"
          size="sm"
        >
          {t('Download')}
        </Button>
        <Button
          icon={<IconCopy size={18} strokeWidth={1.5} />}
          iconPosition="left"
          onClick={copyResponse}
          disabled={!response.data}
          title={t('Copy response to clipboard')}
          color="secondary"
          size="sm"
        >
          {t('Copy')}
        </Button>
      </div>
    </StyledWrapper>
  );
};

export default LargeResponseWarning;
