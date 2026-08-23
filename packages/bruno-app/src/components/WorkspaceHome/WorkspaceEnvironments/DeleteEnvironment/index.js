import React from 'react';
import Portal from 'components/Portal/index';
import toast from 'react-hot-toast';
import Modal from 'components/Modal/index';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import StyledWrapper from './StyledWrapper';
import { deleteGlobalEnvironment } from 'providers/ReduxStore/slices/global-environments';

const DeleteEnvironment = ({ onClose, environment }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const onConfirm = () => {
    dispatch(deleteGlobalEnvironment({ environmentUid: environment.uid }))
      .then(() => {
        toast.success(t('Environment deleted successfully'));
        onClose();
      })
      .catch(() => toast.error(t('An error occurred while deleting the environment')));
  };

  return (
    <Portal>
      <StyledWrapper>
        <Modal
          size="md"
          title={t('Delete Environment')}
          confirmText={t('Delete')}
          handleConfirm={onConfirm}
          handleCancel={onClose}
        >
          {t('Are you sure you want to delete')} <span className="font-semibold">{environment.name}</span>?
        </Modal>
      </StyledWrapper>
    </Portal>
  );
};

export default DeleteEnvironment;
