import { useMemo } from 'react';
import React from 'react';

import { useGetTotalInfo } from '@/apis/team-building/queries';
import Spinner from '@/components/Spinner';
import { css } from '@/styled-system/css';
import { hstack } from '@/styled-system/patterns';

export type ResultProps = {
  teamBuildingUuid: string;
};

type ReshapedTeamInfo = {
  teamUuid: string;
  teamName: string;
  pmName: string;
  members: Array<{
    role: string;
    names: string[];
  }>;
};

export const Result = ({ teamBuildingUuid }: ResultProps) => {
  const { data: totalInfo, isLoading } = useGetTotalInfo(
    teamBuildingUuid,
    false,
  );
  const { teamBuildingInfo, teamInfoList, userInfoList } = totalInfo ?? {};

  const isFinishedTeamBuilding = teamBuildingInfo?.roundStatus === 'COMPLETE';

  const reshapedTeamInfoList = useMemo(() => {
    const reshapedTeamInfoList: Array<ReshapedTeamInfo> = [];
    teamInfoList?.forEach((team) => {
      const joinedMembers =
        userInfoList?.filter((user) => user.joinedTeamUuid === team.uuid) ?? [];
      const reshapedTeamInfo: ReshapedTeamInfo = {
        teamUuid: team.uuid,
        teamName: team.teamName,
        pmName: team.pmName,
        members: [
          {
            role: '디자인',
            names: joinedMembers
              .filter((user) => user.position === 'DESIGNER')
              .map((user) => user.userName),
          },
          {
            role: '프론트',
            names: joinedMembers
              .filter((user) => user.position === 'FRONT_END')
              .map((user) => user.userName),
          },
          {
            role: '백엔드',
            names: joinedMembers
              .filter((user) => user.position === 'BACK_END')
              .map((user) => user.userName),
          },
          {
            role: 'iOS',
            names: joinedMembers
              .filter((user) => user.position === 'IOS')
              .map((user) => user.userName),
          },
          {
            role: '안드로이드',
            names: joinedMembers
              .filter((user) => user.position === 'ANDROID')
              .map((user) => user.userName),
          },
        ].filter((member) => member.names.length > 0),
      };
      reshapedTeamInfoList.push(reshapedTeamInfo);
    });

    return reshapedTeamInfoList;
  }, [teamInfoList, userInfoList]);

  if (isLoading) return <Spinner />;
  return (
    <div
      className={css({
        width: '100%',
        minHeight: '100vh',
        padding: '20px',
        color: 'gray.40',
      })}
    >
      <h1
        className={css({
          textStyle: 'h1',
          marginBottom: '20px',
        })}
      >
        {teamBuildingInfo?.teamBuildingName} <br />
        {isFinishedTeamBuilding ? '팀 빌딩 결과' : '팀 빌딩 결과 (미완료)'}
      </h1>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        })}
      >
        {reshapedTeamInfoList.map((team) => (
          <div
            key={team.teamUuid}
            className={css({
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(12, 13, 14, 0.50)',
              borderRadius: '8px',
              color: 'gray.20',
            })}
          >
            <div
              className={hstack({
                minHeight: '40px',
                gap: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.28)',
                marginBottom: '12px',
              })}
            >
              <h2 className={css({ textStyle: 'h4', flexShrink: '0' })}>
                {team.pmName}
              </h2>
              <div
                className={css({
                  width: '1px',
                  height: '16px',
                  background: 'gray.20',
                })}
              />
              <p className={css({ textStyle: 'p2' })}>{team.teamName}</p>
            </div>
            <div className={hstack({ alignItems: 'stretch' })}>
              {team.members.map((member, index) => (
                <React.Fragment key={index}>
                  <div
                    className={css({
                      display: 'inline-block',
                    })}
                  >
                    <div
                      className={css({ fontSize: '13px', color: 'blue.60' })}
                    >
                      {member.role}
                    </div>
                    <div
                      className={css({ fontSize: '15px', fontWeight: '600' })}
                    >
                      {member.names.join(' ')}
                    </div>
                  </div>
                  {index < team.members.length - 1 && (
                    <div
                      className={css({
                        width: '1px',
                        bg: 'rgba(255, 255, 255, 0.28)',
                      })}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
