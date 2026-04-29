import { Player } from '../types.ts';
import { getHexFromBgClass, getHexFromBorderClass } from '../constants.ts';

const SIZE_CONFIG = {
  xs: { container: 20, icon: 14, border: 1.5, padding: 2 },
  sm: { container: 36, icon: 26, border: 2, padding: 4 },
  md: { container: 56, icon: 40, border: 2.5, padding: 6 },
  lg: { container: 80, icon: 58, border: 3, padding: 8 },
  xl: { container: 112, icon: 80, border: 4, padding: 10 },
} as const;

type AvatarSize = keyof typeof SIZE_CONFIG;

interface PlayerAvatarProps {
  player: Player;
  size?: AvatarSize;
  className?: string;
  imgClassName?: string;
  title?: string;
  imageOverride?: string;
}

const PlayerAvatar = ({
  player,
  size = 'md',
  className = '',
  imgClassName = '',
  title,
  imageOverride,
}: PlayerAvatarProps) => {
  const config = SIZE_CONFIG[size];
  const accentHex = getHexFromBgClass(player.color);
  const borderHex = getHexFromBorderClass(player.borderColor);
  const gradient = `radial-gradient(circle at 30% 30%, ${accentHex}99, ${accentHex})`;
  const imageSrc = imageOverride ?? player.imageUrl;

  return (
    <div
      className={`rounded-full shadow-[0_0_12px_rgba(0,0,0,0.35)] flex items-center justify-center border border-solid ${className}`}
      style={{
        width: config.container,
        height: config.container,
        padding: config.padding,
        borderWidth: config.border,
        background: gradient,
        borderColor: borderHex,
      }}
      title={title ?? player.name}
    >
      <img
        src={imageSrc}
        alt={player.name}
        className={`object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${imgClassName}`}
        style={{ width: config.icon, height: config.icon }}
        loading="lazy"
      />
    </div>
  );
};

export default PlayerAvatar;
