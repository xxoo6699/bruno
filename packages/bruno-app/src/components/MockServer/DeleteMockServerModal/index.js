import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import MockConfirmModal from 'components/MockServer/MockConfirmModal';
import { deleteMockServerInstance } from 'utils/mock-server/mock-server-instances';

const DeleteMockServerModal = ({ instance, onClose, onDeleted }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleConfirm = async () => {
    try {
      await dispatch(deleteMockServerInstance(instance.uid));
      toast.success('Mock server deleted');
      onDeleted?.();
      onClose();
    } catch {
      toast.error('Failed to delete mock server');
    }
  };

  return (
    <MockConfirmModal
      title={t('Delete Mock Server')}
      confirmText={t('Delete')}
      onConfirm={handleConfirm}
      onClose={onClose}
      confirmButtonColor="danger"
      dataTestId="delete-mock-server-modal"
    >
      {t('Are you sure you want to delete')} <span className="font-medium">{instance.name}</span>?
      {instance.sourceType === 'spec' ? (
        <div className="text-xs mt-3 opacity-70">{t('This removes the mock server configuration only. Your API spec file is not deleted.')}</div>
      ) : null}
    </MockConfirmModal>
  );
};

export default DeleteMockServerModal;
