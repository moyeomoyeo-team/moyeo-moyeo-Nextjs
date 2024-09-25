import MobileBackgroundImage from '@/assets/images/mobile.webp';
import { css } from '@/styled-system/css';
import { vstack } from '@/styled-system/patterns';

type MobileLayoutProps = {
  children: React.ReactNode;
};

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        minWidth: 'fit-content',
        position: 'relative',
        backgroundColor: '#290C60',
      })}
    >
      <img
        src={MobileBackgroundImage.src}
        className={css({
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        })}
      />

      <main
        className={vstack({
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        })}
      >
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
