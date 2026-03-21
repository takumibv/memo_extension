import { memo } from 'react';
import { HiCheck } from 'react-icons/hi2';

type Props = {
  onChangeColor?: (color: string) => void;
  color?: string;
  hasDefault?: boolean;
};

const COLORS = [
  // Light colors
  '#FFFFFF',
  '#EB9694',
  '#FAD0C3',
  '#FFF7CC',
  '#C1E1C5',
  '#BEDADC',
  '#C4DEF6',
  '#D4C4FB',
  // Dark colors (for dark mode users)
  '#2D2D2D',
  '#5C3A3A',
  '#4A3728',
  '#4A4528',
  '#2D4A35',
  '#2D4A4A',
  '#2D3A5C',
  '#3D2D5C',
];

// Determine if a hex color is dark (for check mark contrast)
const isDarkColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance formula
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
};

const ColorPicker: React.FC<Props> = memo(({ onChangeColor, color: activeColor = '', hasDefault = false }) => (
  <div className="flex flex-wrap">
    {hasDefault && (
      <button
        className={`relative m-1 h-8 w-12 cursor-pointer overflow-hidden rounded-lg bg-white ${
          hasDefault && activeColor === '' ? 'border-2 border-black' : 'border border-gray-400'
        }`}
        onClick={e => {
          e.stopPropagation();
          onChangeColor?.('');
        }}>
        {hasDefault && activeColor === '' && <HiCheck className="relative z-10 mx-auto h-5 w-5" />}
        <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rotate-45 bg-gray-400" />
      </button>
    )}
    {COLORS.map(color => {
      const isActive = (color === '#FFFFFF' && activeColor === '' && !hasDefault) || color === activeColor;
      const dark = isDarkColor(color);
      return (
        <button
          key={color}
          className={`m-1 h-8 w-12 cursor-pointer rounded-lg text-center ${
            isActive ? (dark ? 'border-2 border-white' : 'border-2 border-black') : 'border border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          onClick={e => {
            e.stopPropagation();
            onChangeColor?.(color);
          }}>
          {isActive && <HiCheck className={`mx-auto h-5 w-5 ${dark ? 'text-white' : 'text-black'}`} />}
        </button>
      );
    })}
  </div>
));

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
export { ColorPicker };
