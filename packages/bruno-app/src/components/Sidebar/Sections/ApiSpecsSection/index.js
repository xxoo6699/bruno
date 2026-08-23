import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { IconFileCode, IconPlus } from '@tabler/icons';

import { openApiSpec } from 'providers/ReduxStore/slices/apiSpec';
import MenuDropdown from 'ui/MenuDropdown';
import ActionIcon from 'ui/ActionIcon';
import CreateApiSpec from 'components/Sidebar/ApiSpecs/CreateApiSpec';
import ApiSpecs from 'components/Sidebar/ApiSpecs';
import SidebarSection from 'components/Sidebar/SidebarSection';

const ApiSpecsSection = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [createApiSpecModalOpen, setCreateApiSpecModalOpen] = useState(false);

  const handleOpenApiSpec = () => {
    dispatch(openApiSpec()).catch((err) => {
      console.error(err);
      toast.error(t('An error occurred while opening the API spec'));
    });
  };

  const addDropdownItems = [
    {
      id: 'create-api-spec',
      leftSection: IconPlus,
      label: t('Create API Spec'),
      onClick: () => {
        setCreateApiSpecModalOpen(true);
      }
    },
    {
      id: 'open-api-spec',
      leftSection: IconFileCode,
      label: t('Open API Spec'),
      onClick: () => {
        handleOpenApiSpec();
      }
    }
  ];

  const sectionActions = (
    <>
      <MenuDropdown
        data-testid="api-specs-header-add-menu"
        items={addDropdownItems}
        placement="bottom-end"
      >
        <ActionIcon
          label={t('Add new API Spec')}
        >
          <IconPlus size={14} stroke={1.5} aria-hidden="true" />
        </ActionIcon>
      </MenuDropdown>
    </>
  );

  return (
    <>
      {createApiSpecModalOpen && (
        <CreateApiSpec
          onClose={() => setCreateApiSpecModalOpen(false)}
        />
      )}
      <SidebarSection
        id="api-specs"
        title={t('API Specs')}
        icon={IconFileCode}
        actions={sectionActions}
        className="api-specs-section"
      >
        <ApiSpecs />
      </SidebarSection>
    </>
  );
};

export default ApiSpecsSection;
