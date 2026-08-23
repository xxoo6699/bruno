import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'components/Modal';
import Portal from 'components/Portal';
import { useDispatch } from 'react-redux';
import { deleteResponseExample } from 'providers/ReduxStore/slices/collections';
import { saveRequest, closeTabs } from 'providers/ReduxStore/slices/collections/actions';

const DeleteResponseExampleModal = ({ onClose, example, item, collection }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onConfirm = (e) => {
    e.stopPropagation();
    dispatch(closeTabs({ tabUids: [example.uid] }));
    dispatch(deleteResponseExample({
      itemUid: item.uid,
      collectionUid: collection.uid,
      exampleUid: example.uid
    }));
    dispatch(saveRequest(item.uid, collection.uid, true))
      .then(() => {
        onClose();
      });
  };

  return (
    <Portal>
      <Modal
        size="sm"
        title={t('Delete Example')}
        confirmText={t('Delete')}
        handleConfirm={onConfirm}
        handleCancel={onClose}
        confirmButtonColor="danger"
      >
        {t('Are you sure you want to delete the example {{name}}?', { name: example.name })}
      </Modal>
    </Portal>
  );
};

export default DeleteResponseExampleModal;
