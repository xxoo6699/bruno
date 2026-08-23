import { useTranslation } from 'react-i18next';
import StyledWrapper from './StyledWrapper';

const ColorRangePicker = ({ selectedColor, className, value, onChange, colorRange, ...props }) => {
  const { t } = useTranslation();
  return (
    <StyledWrapper color={selectedColor} className={className}>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        className="hue-slider"
        style={{
          background: `linear-gradient(to right, ${colorRange.join(',')})`
        }}
        title={t('Adjust color')}
        {...props}
      />
    </StyledWrapper>
  );
};

export default ColorRangePicker;
