import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'components/Modal';
import { isItemAFolder } from 'utils/tabs';
import { useDispatch } from 'react-redux';
import { deleteItem, closeTabs } from 'providers/ReduxStore/slices/collections/actions';
import { recursivelyGetAllItemUids } from 'utils/collections';
import StyledWrapper from './StyledWrapper';
import toast from 'react-hot-toast';

const DeleteCollectionItem = ({ onClose, item, collectionUid }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFolder = isItemAFolder(item);
  const onConfirm = () => {
    dispatch(deleteItem(item.uid, collectionUid)).then(() => {
      if (isFolder) {
        // close all tabs that belong to the folder
        // including the folder itself and its children
        const tabUids = [...recursivelyGetAllItemUids(item.items), item.uid];

        dispatch(
          closeTabs({
            tabUids: tabUids
          })
        );
      } else {
        dispatch(
          closeTabs({
            tabUids: [item.uid]
          })
        );
      }
    }).catch((error) => {
      console.error('Error deleting item', error);
      toast.error(error?.message || t('Error deleting item'));
    });
    onClose();
  };

  return (
    <StyledWrapper>
      <Modal
        size="md"
        title={t(isFolder ? 'Delete Folder' : 'Delete Request')}
        confirmText={t('Delete')}
        confirmButtonColor="danger"
        handleConfirm={onConfirm}
        handleCancel={onClose}
        dataTestId="delete-collection-item-modal"
      >
        {t('Are you sure you want to delete {{name}} ?', { name: item.name })}
      </Modal>
    </StyledWrapper>
  );
};

export default DeleteCollectionItem;
