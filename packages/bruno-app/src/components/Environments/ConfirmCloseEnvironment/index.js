import React from 'react';
import { IconAlertTriangle } from '@tabler/icons';
import Modal from 'components/Modal';
import Portal from 'components/Portal';
import Button from 'ui/Button';
import { useTranslation } from 'react-i18next';

const ConfirmCloseEnvironment = ({ onCancel, onCloseWithoutSave, onSaveAndClose, isGlobal, isDotEnv }) => {
  const { t } = useTranslation();
  let settingsLabel = t('collection environment settings');
  if (isDotEnv) {
    settingsLabel = t('.env file');
  } else if (isGlobal) {
    settingsLabel = t('global environment settings');
  }

  return (
    <Portal>
      <Modal
        size="md"
        title={t('Unsaved changes')}
        disableEscapeKey={true}
        disableCloseOnOutsideClick={true}
        closeModalFadeTimeout={150}
        handleCancel={onCancel}
        hideFooter={true}
      >
        <div className="flex items-center font-normal">
          <IconAlertTriangle size={32} strokeWidth={1.5} className="text-yellow-600" />
          <h1 className="ml-2 text-lg font-medium">{t('Hold on...')}</h1>
        </div>
        <div className="font-normal mt-4">
          {t('You have unsaved changes in {{label}}.', { label: settingsLabel })}
        </div>

        <div className="flex justify-between mt-6">
          <div>
            <Button color="danger" onClick={onCloseWithoutSave} data-testid="env-unsaved-close-without-save">
              {t('Don\'t Save')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button color="secondary" variant="ghost" onClick={onCancel} data-testid="env-unsaved-cancel">
              {t('Cancel')}
            </Button>
            <Button onClick={onSaveAndClose} data-testid="env-unsaved-save-and-close">
              {t('Save')}
            </Button>
          </div>
        </div>
      </Modal>
    </Portal>
  );
};

export default ConfirmCloseEnvironment;
