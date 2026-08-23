import React from 'react';
import toast from 'react-hot-toast';
import Modal from 'components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { IconFolder } from '@tabler/icons';
import { closeWorkspaceAction } from 'providers/ReduxStore/slices/workspaces/actions';
import { useTranslation } from 'react-i18next';

const CloseWorkspace = ({ workspaceUid, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { workspaces } = useSelector((state) => state.workspaces);
  const workspace = workspaces.find((w) => w.uid === workspaceUid);

  const onConfirm = async () => {
    try {
      if (!workspace) {
        toast.error(t('Workspace not found'));
        onClose();
        return;
      }
      if (workspace.type === 'default') {
        toast.error(t('Cannot close the default workspace'));
        onClose();
        return;
      }

      await dispatch(closeWorkspaceAction(workspace.uid));
      toast.success(t('Workspace closed'));
      onClose();
    } catch (error) {
      console.error('Error closing workspace:', error);
      toast.error(t('An error occurred while closing the workspace'));
    }
  };

  return (
    <Modal
      size="sm"
      title={t('Close Workspace')}
      confirmText={t('Close')}
      handleConfirm={onConfirm}
      handleCancel={onClose}
    >
      <div className="flex items-center">
        <IconFolder size={18} strokeWidth={1.5} />
        <span className="ml-2 mr-4 font-semibold">{workspace?.name}</span>
      </div>
      {workspace?.pathname && (
        <div className="break-words text-xs mt-1">{workspace.pathname}</div>
      )}
      <div className="mt-4">
        {t('Are you sure you want to close workspace')} <span className="font-semibold">{workspace?.name}</span>?
      </div>
      <div className="mt-4">
        {t('It will still be available in the file system at the above location and can be re-opened later.')}
      </div>
    </Modal>
  );
};

export default CloseWorkspace;
