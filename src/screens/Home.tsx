'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import HomeLogo from '@/assets/icons/homeLogo.svg?url';
import { Button } from '@/components/Button';
import { css } from '@/styled-system/css';
import { vstack } from '@/styled-system/patterns';
import { playSound } from '@/utils/sound';

const Home = () => {
  const router = useRouter();

  const handleCreateButton = () => {
    router.push('/create');
    playSound('페이지_전환');
  };

  return (
    <section
      className={vstack({
        width: '660px',
        gap: '64px',
      })}
    >
      <Image
        width="600"
        height="400"
        src={HomeLogo}
        alt="모여모여 서비스 로고"
      />

      <Button
        color="secondary"
        size="medium"
        className={css({
          width: '320px !important',
        })}
        onClick={handleCreateButton}
      >
        팀 빌딩 준비하기
      </Button>
    </section>
  );
};

export default Home;
