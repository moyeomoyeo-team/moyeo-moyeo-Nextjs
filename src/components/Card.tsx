import androidImg from '@/assets/icons/character/android-128.png';
import backendImg from '@/assets/icons/character/backend-128.png';
import designerImg from '@/assets/icons/character/designer-128.png';
import frontendImg from '@/assets/icons/character/frontend-128.png';
import iosImg from '@/assets/icons/character/ios-128.png';
import CheckIcon from '@/assets/icons/check.svg';
import LinkIcon from '@/assets/icons/link.svg';
import NoLinkIcon from '@/assets/icons/noLink.svg';
import { css, cva, cx } from '@/styled-system/css';
import { center, hstack, vstack } from '@/styled-system/patterns';
import { Position, Round } from '@/types';
import { POSITION } from '@/utils/const';
import { playSound } from '@/utils/sound';

export type CardProps = {
  name: string;
  position: Position;
  choice?: Round;
  border?: 'default' | 'yellow' | 'selected';
  link?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

const choiceRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textStyle: 'h4',
    height: '100%',
    width: '54px',
    borderRadius: '8px',
    boxShadow: '0px 0px 6px 0px rgba(34, 34, 42, 0.10)',
  },
  variants: {
    choice: {
      FIRST_ROUND: { background: 'purple.40' },
      SECOND_ROUND: { background: 'purple.50' },
      THIRD_ROUND: { background: 'purple.60' },
      FOURTH_ROUND: { background: 'purple.70' },
      ADJUSTED_ROUND: { background: 'gray.60' },
      START: {},
      COMPLETE: {},
    },
  },
});

const cardRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.11)',
    color: 'gray.5',
    borderRadius: '20px',
    gap: '12px',
    transition: 'border 0.3s ease-in-out',
    position: 'relative',
  },
  variants: {
    border: {
      default: {
        border: '1px solid rgba(255, 255, 255, 0.23)',
      },
      yellow: {
        border: '2px solid token(colors.yellow.20)',
      },
      selected: {
        border: '1px solid rgba(255, 255, 255, 0.11)',
      },
    },
  },
  defaultVariants: {
    border: 'default',
  },
});

const imageUrl = {
  FRONT_END: frontendImg,
  BACK_END: backendImg,
  DESIGNER: designerImg,
  ANDROID: androidImg,
  IOS: iosImg,
};

const choiceLabelMap: Record<Round, string> = {
  FIRST_ROUND: '1지망',
  SECOND_ROUND: '2지망',
  THIRD_ROUND: '3지망',
  FOURTH_ROUND: '4지망',
  ADJUSTED_ROUND: 'E',
  START: '-',
  COMPLETE: '-',
};

export const Card = ({
  name,
  position,
  choice = 'FIRST_ROUND',
  link,
  border,
  selected = false,
  onClick,
  className,
}: CardProps) => {
  const positionName = POSITION[position];

  return (
    <button className={cx(cardRecipe({ border }), className)} onClick={onClick}>
      <div className={vstack({ alignItems: 'flex-start' })}>
        <div className={hstack({ gap: '6px', height: '28px' })}>
          <span className={choiceRecipe({ choice })}>
            {choiceLabelMap[choice]}
          </span>
          <a
            className={center({
              background: link
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(255, 255, 255, 0.09)',
              height: '100%',
              padding: '0 2px',
              borderRadius: '8px',
              cursor: link ? 'pointer' : 'default',
              transition: 'background 0.3s ease-in-out',
              _hover: {
                background: link ? 'rgba(255, 255, 255, 0.3)' : '',
              },
            })}
            href={link}
            // @note: 툴팁같은 효과를 주기 위함
            title={link}
            target={'_blank'}
            onClick={(e) => {
              e.stopPropagation();
              // @note: link가 없으면 클릭이벤트를 막음
              if (!link) e.preventDefault();
              playSound('버튼_클릭');
            }}
          >
            {link ? (
              <LinkIcon />
            ) : (
              <NoLinkIcon fill="rgba(255, 255, 255, 0.5)" />
            )}
          </a>
        </div>
        <div className={vstack({ alignItems: 'flex-start', gap: '2px' })}>
          <p className={css({ textStyle: 'h3' })}>{name}</p>
          <p
            className={css({
              textStyle: 'h4',
              color: 'rgba(255, 255, 255, 0.64)',
            })}
          >
            {positionName}
          </p>
        </div>
      </div>
      <div
        className={css({
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
          height: '100%',
        })}
      >
        <img
          className={css({
            width: '88px',
            height: '100%',
            aspectRatio: '1',
            objectFit: 'cover',
            borderRadius: '10px',
          })}
          src={imageUrl[position].src}
        />
      </div>
      {selected && (
        <div
          className={center({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(12, 13, 14, 0.6)',
            borderRadius: '20px',
          })}
        >
          <CheckIcon width="40" height="40" />
        </div>
      )}
    </button>
  );
};
