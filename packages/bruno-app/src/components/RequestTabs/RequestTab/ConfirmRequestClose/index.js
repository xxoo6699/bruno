import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle } from '@tabler/icons';
import Modal from 'components/Modal';
import Button from 'ui/Button';
import Portal from 'ui/Portal';

const ConfirmRequestClose = ({ item, example, onCancel, onCloseWithoutSave, onSaveAndClose }) => {
  const { t } = useTranslation();
  const isExample = !!example;
  const itemName = isExample ? example.name : item.name;
  const itemType = isExample ? 'example' : 'request';

  return (
    <Portal>
      <Modal
        size="md"
        title={t('Unsaved changes')}
        confirmText={t('Save and Close')}
        cancelText={t('Close without saving')}
        disableEscapeKey={true}
        disableCloseOnOutsideClick={true}
        closeModalFadeTimeout={150}
        handleCancel={onCancel}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        hideFooter={true}
      >
        <div className="flex items-center font-normal">
          <IconAlertTriangle size={32} strokeWidth={1.5} className="text-yellow-600" />
          <h1 className="ml-2 text-lg font-medium">{t('Hold on..')}</h1>
        </div>
        <div className="font-normal mt-4">
          {t('You have unsaved changes in {{itemType}} {{itemName}}.', { itemType: t(itemType), itemName })}
        </div>

        <div className="flex justify-between mt-6">
          <div>
            <Button color="danger" onClick={onCloseWithoutSave}>
              {t('Don\'t Save')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button color="secondary" variant="ghost" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button onClick={onSaveAndClose}>{t('Save')}</Button>
          </div>
        </div>
      </Modal>
    </Portal>
  );
};

export default ConfirmRequestClose;
