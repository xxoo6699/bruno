import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MockConfirmModal from 'components/MockServer/MockConfirmModal';

const GenerateFromSpecModal = ({ specName, onClose, onConfirm, isGenerating }) => {
  const { t } = useTranslation();
  const [generateFromSchema, setGenerateFromSchema] = useState(true);

  return (
    <MockConfirmModal
      size="md"
      title={t('Generate from API Spec')}
      confirmText={isGenerating ? t('Generating...') : t('Generate')}
      onConfirm={() => onConfirm({ generateFromSchema })}
      onClose={onClose}
      confirmDisabled={isGenerating}
      dataTestId="mock-response-generate-from-spec-modal"
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          {t('Generate mock responses from {{name}}? Each operation status code becomes its own mock response. The lowest status code is matched first by default; add rules to route other variants.', { name: specName || t('this API spec') })}
        </p>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={generateFromSchema}
            onChange={(event) => setGenerateFromSchema(event.target.checked)}
            data-testid="mock-response-generate-from-schema-checkbox"
          />
          <span>
            {t('Generate response bodies from schema')}
            <span className="block text-xs opacity-70 mt-1">
              {t('Uses faker-backed sample data when a response schema is available. Uncheck to create empty JSON bodies.')}
            </span>
          </span>
        </label>
      </div>
    </MockConfirmModal>
  );
};

export default GenerateFromSpecModal;
