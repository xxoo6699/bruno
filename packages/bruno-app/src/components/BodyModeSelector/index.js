import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCaretDown, IconForms, IconBraces, IconCode, IconFileText, IconDatabase, IconFile, IconX } from '@tabler/icons';
import MenuDropdown from 'ui/MenuDropdown';
import { humanizeRequestBodyMode } from 'utils/collections';
import StyledWrapper from './StyledWrapper';

const DEFAULT_MODES = [
  {
    name: 'Form',
    options: [
      { id: 'multipartForm', label: 'Multipart Form', leftSection: IconForms },
      { id: 'formUrlEncoded', label: 'Form URL Encoded', leftSection: IconForms }
    ]
  },
  {
    name: 'Raw',
    options: [
      { id: 'json', label: 'JSON', leftSection: IconBraces },
      { id: 'xml', label: 'XML', leftSection: IconCode },
      { id: 'text', label: 'TEXT', leftSection: IconFileText },
      { id: 'sparql', label: 'SPARQL', leftSection: IconDatabase }
    ]
  },
  {
    name: 'Other',
    options: [
      { id: 'file', label: 'File / Binary', leftSection: IconFile },
      { id: 'none', label: 'No Body', leftSection: IconX }
    ]
  }
];

const BodyModeSelector = ({
  currentMode,
  onModeChange,
  modes = DEFAULT_MODES,
  disabled = false,
  className = '',
  wrapperClassName = '',
  placement = 'bottom-end',
  'data-testid': testId
}) => {
  const { t } = useTranslation();

  // Add onClick handlers to mode options
  const menuItems = useMemo(() => {
    return modes.map((group) => ({
      ...group,
      name: t(group.name),
      options: group.options.map((option) => ({
        ...option,
        label: t(option.label),
        onClick: () => onModeChange(option.id)
      }))
    }));
  }, [modes, onModeChange, t]);

  return (
    <StyledWrapper className={wrapperClassName}>
      <div className={`inline-flex items-center body-mode-selector ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
        <MenuDropdown
          items={menuItems}
          placement={placement}
          disabled={disabled}
          className={className}
          selectedItemId={currentMode}
          showGroupDividers={false}
          groupStyle="select"
          data-testid={testId}
        >
          <div className="flex items-center justify-center pl-3 py-1 select-none selected-body-mode">
            {humanizeRequestBodyMode(currentMode)}
            {' '}
            <IconCaretDown className="caret ml-2" size={14} strokeWidth={2} />
          </div>
        </MenuDropdown>
      </div>
    </StyledWrapper>
  );
};

export default BodyModeSelector;
