import React from 'react';
import Portal from 'components/Portal/index';
import Modal from 'components/Modal/index';
import { useTranslation } from 'react-i18next';
import StyledWrapper from './StyledWrapper';

const DeleteDotEnvFile = ({ onClose, onConfirm, filename = '.env' }) => {
  const { t } = useTranslation();
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Portal>
      <StyledWrapper>
        <Modal
          size="sm"
          title={t('Delete {{filename}} File', { filename })}
          confirmText={t('Delete')}
          handleConfirm={handleConfirm}
          handleCancel={onClose}
          confirmButtonColor="danger"
        >
          {t('Are you sure you want to delete')} <span className="font-medium">{filename}</span> {t('file?')}
        </Modal>
      </StyledWrapper>
    </Portal>
  );
};

export default DeleteDotEnvFile;
