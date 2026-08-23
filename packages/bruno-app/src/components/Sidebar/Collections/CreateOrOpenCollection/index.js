import { useTheme } from '../../../../providers/Theme';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setIsOpeningCollection } from 'providers/ReduxStore/slices/app';

import styled from 'styled-components';
import StyledWrapper from './StyledWrapper';

const LinkStyle = styled.span`
  color: ${(props) => props.theme['text-link']};
`;

const CreateOrOpenCollection = ({ onCreateClick }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleOpenCollection = () => {
    dispatch(setIsOpeningCollection(true));
  };
  const CreateLink = () => (
    <LinkStyle
      className="underline text-link cursor-pointer"
      theme={theme}
      onClick={onCreateClick}
    >
      {t('Create')}
    </LinkStyle>
  );
  const OpenLink = () => (
    <LinkStyle className="underline text-link cursor-pointer" theme={theme} onClick={() => handleOpenCollection(true)}>
      {t('Open')}
    </LinkStyle>
  );

  return (
    <StyledWrapper className="px-2 mt-4">
      <div className="text-xs text-center">
        <div>{t('No collections found.')}</div>
        <div className="mt-2">
          <CreateLink /> {t('or')} <OpenLink /> {t('Collection.')}
        </div>
      </div>
    </StyledWrapper>
  );
};

export default CreateOrOpenCollection;
