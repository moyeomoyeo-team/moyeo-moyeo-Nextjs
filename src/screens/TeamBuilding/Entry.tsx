import { useLayoutEffect } from 'react';

import { useGetTotalInfo } from '@/apis/team-building/queries';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { css } from '@/styled-system/css';
import { vstack } from '@/styled-system/patterns';
import { Team } from '@/types';
import { playSound } from '@/utils/sound';

type EntryProps = {
  teamBuildingUuid: string;
  teamUuid: Team['uuid'] | null;
  setRole: (role: 'admin' | 'player') => void;
  setTeamUuid: (teamUuid: Team['uuid']) => void;
  setShowLottie: (isShow: boolean) => void;
};

export const Entry = ({
  teamBuildingUuid,
  teamUuid,
  setRole,
  setTeamUuid,
  setShowLottie,
}: EntryProps) => {
  const { data: totalInfo } = useGetTotalInfo(teamBuildingUuid);

  useLayoutEffect(() => {
    setShowLottie(true);
    return () => {
      setShowLottie(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={vstack({
        gap: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderRadius: '20px',
        padding: '80px 40px',
        backdropFilter: 'blur(50px)',
      })}
    >
      <h1
        className={css({
          fontFamily: 'GmarketSansBold',
          fontSize: '48px',
          fontWeight: '400',
          textAlign: 'center',
          lineHeight: '1',
          color: 'gray.5',
        })}
      >
        {totalInfo?.teamBuildingInfo.teamBuildingName}
      </h1>
      <span
        className={css({
          textStyle: 'p1',
          color: 'gray.10',
          marginTop: '120px',
        })}
      >
        자신에게 해당하는 아이디어를 선택해주세요
      </span>
      <div
        className={vstack({
          width: '330px',
          margin: '0 auto',
          gap: '0',
        })}
      >
        <div className={css({ width: '100%', marginTop: '12px' })}>
          <Select
            placeholder="본인의 아이디어를 선택해주세요"
            options={totalInfo?.teamInfoList.map((team) => ({
              value: team.uuid,
              label: `${team.pmName} - ${team.teamName}`,
            }))}
            onChange={(e) => {
              setTeamUuid(e?.value || '');
            }}
          />
        </div>
        <Button
          disabled={!teamUuid}
          size="medium"
          onClick={() => {
            setRole('player');
            playSound('페이지_전환');
          }}
          className={css({ marginTop: '80px' })}
        >
          PM으로 입장하기
        </Button>
        <button
          type="button"
          onClick={() => {
            setRole('admin');
            playSound('페이지_전환');
          }}
          className={css({
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.8)',
            padding: '12px',
            marginTop: '12px',
          })}
        >
          운영진으로 참여하기
        </button>
      </div>
    </section>
  );
};
