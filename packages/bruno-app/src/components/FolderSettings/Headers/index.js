import React, { useState, useCallback, useRef } from 'react';
import get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'providers/Theme';
import { useTranslation } from 'react-i18next';
import { setFolderHeaders } from 'providers/ReduxStore/slices/collections';
import { saveFolderRoot } from 'providers/ReduxStore/slices/collections/actions';
import { updateTableColumnWidths } from 'providers/ReduxStore/slices/tabs';
import SingleLineEditor from 'components/SingleLineEditor';
import EditableTable from 'components/EditableTable';
import { createDescriptionColumn } from 'components/EditableTable/descriptionColumn';
import StyledWrapper from './StyledWrapper';
import { headers as StandardHTTPHeaders } from 'know-your-http-well';
import { MimeTypes } from 'utils/codemirror/autocompleteConstants';
import BulkEditor from 'components/BulkEditor/index';
import Button from 'ui/Button';
import { headerNameRegex, headerValueRegex } from 'utils/common/regex';
import { usePersistedState } from 'hooks/usePersistedState';
import { useTrackScroll } from 'hooks/useTrackScroll';
import { useFocusTableRow } from 'hooks/useFocusTableRow';

const headerAutoCompleteList = StandardHTTPHeaders.map((e) => e.header);

const Headers = ({ collection, folder }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();
  const { t } = useTranslation();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const headers = folder.draft
    ? get(folder, 'draft.request.headers', [])
    : get(folder, 'root.request.headers', []);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const wrapperRef = useRef(null);
  const [scroll, setScroll] = usePersistedState({ key: `folder-headers-scroll-${folder.uid}`, default: 0 });
  const { focusRow, onFocusRowHandled } = useFocusTableRow({ uid: folder.uid, tableId: 'folder-headers' });
  useTrackScroll({
    ref: wrapperRef,
    selector: '.folder-settings-content',
    onChange: setScroll,
    initialValue: scroll,
    restoreOnMount: !focusRow
  });

  // Get column widths from Redux
  const focusedTab = tabs?.find((t) => t.uid === activeTabUid);
  const folderHeadersWidths = focusedTab?.tableColumnWidths?.['folder-headers'] || {};

  const handleColumnWidthsChange = (tableId, widths) => {
    dispatch(updateTableColumnWidths({ uid: activeTabUid, tableId, widths }));
  };

  const toggleBulkEditMode = () => {
    setIsBulkEditMode(!isBulkEditMode);
  };

  const handleHeadersChange = useCallback((updatedHeaders) => {
    dispatch(setFolderHeaders({
      collectionUid: collection.uid,
      folderUid: folder.uid,
      headers: updatedHeaders
    }));
  }, [dispatch, collection.uid, folder.uid]);

  const handleSave = () => dispatch(saveFolderRoot(collection.uid, folder.uid));

  const getRowError = useCallback((row, index, key) => {
    if (key === 'name') {
      if (!row.name || row.name.trim() === '') return null;
      if (!headerNameRegex.test(row.name)) {
        return t('Header name cannot contain spaces or newlines');
      }
    }
    if (key === 'value') {
      if (!row.value) return null;
      if (!headerValueRegex.test(row.value)) {
        return t('Header value cannot contain newlines');
      }
    }
    return null;
  }, [t]);

  const descriptionColumn = createDescriptionColumn({
    theme: storedTheme,
    onSave: handleSave,
    collection,
    item: folder
  });

  const columns = [
    {
      key: 'name',
      name: t('Name'),
      isKeyField: true,
      placeholder: t('Name'),
      width: '20%',
      render: ({ value, onChange }) => (
        <SingleLineEditor
          value={value || ''}
          theme={storedTheme}
          onSave={handleSave}
          onChange={(newValue) => onChange(newValue.replace(/[\r\n]/g, ''))}
          autocomplete={headerAutoCompleteList}
          collection={collection}
          placeholder={!value ? t('Name') : ''}
        />
      )
    },
    {
      key: 'value',
      name: t('Value'),
      placeholder: t('Value'),
      render: ({ value, onChange }) => (
        <SingleLineEditor
          value={value || ''}
          theme={storedTheme}
          onSave={handleSave}
          onChange={onChange}
          collection={collection}
          item={folder}
          autocomplete={MimeTypes}
          placeholder={!value ? t('Value') : ''}
        />
      )
    },
    descriptionColumn
  ];

  const defaultRow = {
    name: '',
    value: '',
    description: ''
  };

  if (isBulkEditMode) {
    return (
      <StyledWrapper className="w-full">
        <div className="text-xs mb-4 text-muted">
          {t('Request headers that will be sent with every request inside this folder.')}
        </div>
        <BulkEditor
          params={headers}
          onChange={handleHeadersChange}
          onToggle={toggleBulkEditMode}
          onSave={handleSave}
        />
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper className="w-full" ref={wrapperRef}>
      <div className="text-xs mb-4 text-muted">
        {t('Request headers that will be sent with every request inside this folder.')}
      </div>
      <EditableTable
        tableId="folder-headers"
        testId="folder-headers"
        columns={columns}
        rows={headers}
        onChange={handleHeadersChange}
        defaultRow={defaultRow}
        getRowError={getRowError}
        columnWidths={folderHeadersWidths}
        onColumnWidthsChange={(widths) => handleColumnWidthsChange('folder-headers', widths)}
        initialScroll={scroll}
        focusRow={focusRow}
        onFocusRowHandled={onFocusRowHandled}
      />
      <div className="flex justify-end mt-2">
        <button className="text-link select-none" data-testid="bulk-edit-toggle" onClick={toggleBulkEditMode}>
          {t('Bulk Edit')}
        </button>
      </div>
      <div className="mt-6">
        <Button type="submit" size="sm" onClick={handleSave}>
          {t('Save')}
        </Button>
      </div>
    </StyledWrapper>
  );
};

export default Headers;
