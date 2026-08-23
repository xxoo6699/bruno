import { useTranslation } from 'react-i18next';
import Button from 'ui/Button';
import Modal from 'components/Modal';

const DisconnectSyncModal = ({ onConfirm, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal
      size="sm"
      title={t('Disconnect Sync')}
      hideFooter={true}
      handleCancel={onClose}
    >
      <div className="disconnect-modal">
        <p className="disconnect-message">
          <>{t('Are you sure you want to disconnect OpenAPI sync?')} </> <br /> <br />
          <>{t('This will only disconnect the sync configuration. Your collection will remain intact.')}</>
        </p>
        <div className="disconnect-actions">
          <Button variant="ghost" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button color="danger" onClick={onConfirm}>
            Disconnect
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DisconnectSyncModal;
