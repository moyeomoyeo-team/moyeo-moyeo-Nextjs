'use client';

import { useLayoutEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useGetTotalInfo } from '@/apis/team-building/queries';
import Spinner from '@/components/Spinner';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { Team } from '@/types';

import NotFound from '../NotFound';
import { Admin } from './Admin';
import { Entry } from './Entry';
import { Player } from './Player';

export type TeamBuildingProps = {
  teamBuildingUuid: string;
  setShowLottie: (isShow: boolean) => void;
};

const TeamBuilding = ({
  teamBuildingUuid,
  setShowLottie,
}: TeamBuildingProps) => {
  const [role, setRole] = useState<'admin' | 'player' | null>(null);
  const [teamUuid, setTeamUuid] = useState<Team['uuid'] | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, data: totalInfo } = useGetTotalInfo(teamBuildingUuid);

  useLayoutEffect(() => {
    if (searchParams?.get('role') === 'admin' && pathname) {
      setRole('admin');
      router.replace(pathname);
    }
    // @note: 한번만 실행되어야 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useBeforeUnload(role !== null);

  if (isLoading) return <Spinner />;
  if (!teamBuildingUuid || !totalInfo) return <NotFound />;
  if (!role)
    return (
      <Entry
        teamBuildingUuid={teamBuildingUuid}
        teamUuid={teamUuid}
        setRole={setRole}
        setTeamUuid={setTeamUuid}
        setShowLottie={setShowLottie}
      />
    );
  return role === 'player' && !!teamUuid ? (
    <Player teamUuid={teamUuid} teamBuildingUuid={teamBuildingUuid} />
  ) : (
    <Admin teamBuildingUuid={teamBuildingUuid} />
  );
};

export default TeamBuilding;
