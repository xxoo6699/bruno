import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'components/Modal';
import { useDispatch } from 'react-redux';
import { IconFileCode } from '@tabler/icons';
import { closeApiSpecFile } from 'providers/ReduxStore/slices/apiSpec';

const CloseApiSpec = ({ onClose, apiSpec }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onConfirm = () => {
    dispatch(closeApiSpecFile({ uid: apiSpec.uid }))
      .then(() => {
        toast.success(t('API Spec closed'));
        onClose();
      })
      .catch(() => toast.error(t('An error occurred while closing the API Spec')));
  };

  return (
    <Modal size="sm" title={t('Close Api Spec')} confirmText={t('Close')} handleConfirm={onConfirm} handleCancel={onClose}>
      <div className="flex items-center">
        <IconFileCode size={18} strokeWidth={1.5} />
        <span className="ml-2 mr-4 font-semibold">{apiSpec.name}</span>
      </div>
      <div className="break-words text-xs mt-1">{apiSpec.pathname}</div>
      <div className="mt-4">
        {t('Are you sure you want to close API Spec')} <span className="font-semibold">{apiSpec.name}</span> {t('in Bruno?')}
      </div>
      <div className="mt-4">
        {t('It will still be available in the file system at the above location and can be re-opened later.')}
      </div>
    </Modal>
  );
};

export default CloseApiSpec;
