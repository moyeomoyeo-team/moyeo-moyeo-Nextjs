import { useLayoutEffect, useMemo, useState } from 'react';

import toast from 'react-hot-toast';

import {
  useAdjustUser,
  useDeleteUser,
  useFinishTeamBuilding,
} from '@/apis/admin/mutations';
// import { BASE_URL } from '@/apis/http';
import { useGetTotalInfo } from '@/apis/team-building/queries';
import { ReactComponent as Face } from '@/assets/icons/face.svg';
import { ReactComponent as Group } from '@/assets/icons/group.svg';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ChipWithUser } from '@/components/ChipWithUser';
import { LinearProgress } from '@/components/LinearProgress';
import { Step, Stepper } from '@/components/stepper';
import { useDisclosure } from '@/hooks/useDisclosure';
import { SelectTeamModal } from '@/modals/SelectTeamModal';
import { ShareSurveyModal } from '@/modals/ShareSurveyModal';
import { css } from '@/styled-system/css';
import { hstack, stack, vstack } from '@/styled-system/patterns';
import { Round, Team, User } from '@/types';
import { playSound } from '@/utils/sound';
import { toastWithSound } from '@/utils/toast';

const ROUNDS = [
  {
    label: '1지망',
    Icon: Face,
  },
  {
    label: '2지망',
    Icon: Face,
  },
  {
    label: '3지망',
    Icon: Face,
  },
  {
    label: '4지망',
    Icon: Face,
  },
  {
    label: '팀 구성 조정',
    Icon: Group,
  },
];

const roundIndexMap: Record<Round, number> = {
  FIRST_ROUND: 0,
  SECOND_ROUND: 1,
  THIRD_ROUND: 2,
  FORTH_ROUND: 3,
  ADJUSTED_ROUND: 4,
  COMPLETE: 5, // @note: 해당 값으로 넘어가면 stepper는 선택된게 없다.
};

export type AdminProps = {
  teamBuildingUuid: string;
};

export const Admin = ({ teamBuildingUuid }: AdminProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const selectTeamModalProps = useDisclosure();
  const shareSurveyModalProps = useDisclosure();

  const { data } = useGetTotalInfo(teamBuildingUuid);
  const { teamBuildingInfo, teamInfoList, userInfoList } = data ?? {};

  const { mutate: adjustUser } = useAdjustUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: finishTeamBuilding } = useFinishTeamBuilding();

  const activeStep =
    roundIndexMap[teamBuildingInfo?.roundStatus ?? 'FIRST_ROUND'];
  const processValue = (teamInfoList ?? []).reduce(
    (acc, team) => (acc += team.selectDone ? 1 : 0),
    0,
  );
  const canFinishTeamBuilding = useMemo(() => {
    if (teamBuildingInfo?.roundStatus !== 'ADJUSTED_ROUND') return false;
    return userInfoList?.every((user) => user.joinedTeamUuid !== null) ?? false;
  }, [teamBuildingInfo?.roundStatus, userInfoList]);

  const allMemberByTeam = useMemo(() => {
    const allMemberByTeam: Record<Team['pmName'], User[]> = {};

    teamInfoList?.forEach((team) => {
      const key = `${team.pmName} - ${team.teamName}`;

      allMemberByTeam[key] = [
        {
          uuid: 'pm',
          userName: team.pmName,
          position: team.pmPosition,
          choices: [],
          joinedTeamUuid: team.uuid,
          profileLink: '',
          selectedTeam: true,
        } as User,
        ...(userInfoList ?? []).filter(
          (user) => user.joinedTeamUuid === team.uuid,
        ),
      ];
    });

    allMemberByTeam['남은 인원'] = (userInfoList ?? []).filter(
      (user) => user.joinedTeamUuid === null,
    );

    return Object.entries(allMemberByTeam);
  }, [teamInfoList, userInfoList]);

  const handleCloseModal = () => {
    setSelectedUser(null);
    selectTeamModalProps.onClose();
  };

  const handleSelectTeam = (teamUuid: Team['uuid'] | null) => {
    if (!selectedUser) return;

    if (teamUuid === null) {
      return adjustUser(
        {
          teamBuildingUuid,
          userUuid: selectedUser.uuid,
          body: {
            teamUuid: null,
          },
        },
        {
          onSuccess: () => {
            // @todo: 쿼리 클라이언트 수정
            toastWithSound.success(
              `${selectedUser.userName}님의 팀 배정을 해제했습니다.`,
            );
          },
        },
      );
    }

    const team = teamInfoList?.find((team) => team.uuid === teamUuid);
    if (team) {
      return adjustUser(
        {
          teamBuildingUuid,
          userUuid: selectedUser.uuid,
          body: {
            teamUuid: team.uuid,
          },
        },
        {
          onSuccess: () => {
            // @todo: 쿼리 클라이언트 수정
            toastWithSound.success(
              `${selectedUser.userName}님을 ${team.pmName}팀으로 배정했습니다.`,
            );
          },
        },
      );
    }
  };

  const handleClickShareSurvey = () => {
    shareSurveyModalProps.onOpen();
  };

  const handleClickShareLink = () => {
    navigator.clipboard.writeText(location.href);
    toastWithSound.success('참여 링크가 복사되었습니다');
  };

  const handleClickFinishTeamBuilding = () => {
    finishTeamBuilding(
      {
        teamBuildingUuid,
      },
      {
        onSuccess: () => {
          toast.success('팀 빌딩을 완료했습니다.');
          playSound('팀빌딩_완료');
        },
      },
    );
  };

  useLayoutEffect(() => {
    if (sessionStorage.getItem('showAdminGuide') === 'true') return;
    shareSurveyModalProps.onOpen();
    sessionStorage.setItem('showAdminGuide', 'true');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   const eventSource = new EventSource(
  //     `${BASE_URL}/notification/team-building/${teamBuildingUuid}/subscribe`,
  //   );
  //   eventSource.onopen = () => {
  //     console.log('SSE 연결됨');
  //   };
  //   eventSource.onerror = (e) => {
  //     console.log('SSE 에러 발생', e);
  //   };
  //   eventSource.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     console.log(data);
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, [teamBuildingUuid]);

  const renderUser = (selectUser: User) => {
    return (
      <ChipWithUser
        key={selectUser.uuid}
        user={selectUser}
        onClickReassign={() => {
          setSelectedUser(selectUser);
          selectTeamModalProps.onOpen();
          // 이후 로직은 handleSelectTeam에서 처리됨.
        }}
        onClickDelete={() => {
          if (confirm(`${selectUser.userName}님을 삭제하시겠습니까?`)) {
            deleteUser(
              { teamBuildingUuid, userUuid: selectUser.uuid },
              {
                onSuccess: () => {
                  toastWithSound.success(
                    `${selectUser.userName}님을 삭제했습니다.`,
                  );
                },
              },
            );
          }
        }}
      />
    );
  };

  return (
    <>
      <section
        className={vstack({
          flex: 1,
          width: '1280px',
          gap: '40px',
          color: 'gray.5',
          paddingBottom: '80px',
        })}
      >
        <nav
          className={stack({
            width: '100%',
            gap: '12px',
            justifyContent: 'space-between',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.11)',
            borderRadius: '0 0 20px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(50px)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          })}
        >
          <header className={hstack()}>
            <h1 className={css({ flex: '1', textStyle: 'h1' })}>
              {teamBuildingInfo?.teamBuildingName}
            </h1>
            <div className={hstack({ gap: '12px' })}>
              <button
                className={css({
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.13)',
                  textStyle: 'h4',
                  color: 'gray.20',
                  cursor: 'pointer',
                })}
                onClick={handleClickShareSurvey}
              >
                설문 링크 복사하기
              </button>
              <button
                className={css({
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.13)',
                  textStyle: 'h4',
                  color: 'gray.20',
                  cursor: 'pointer',
                })}
                onClick={handleClickShareLink}
              >
                참여 링크 복사하기
              </button>
            </div>
          </header>

          <div className={hstack({ justifyContent: 'space-between' })}>
            <div className={hstack()}>
              <h3 className={css({ textStyle: 'h3' })}>현재 라운드</h3>
              <Stepper activeStep={activeStep}>
                {ROUNDS.map(({ label, Icon }, index) => (
                  <Step key={label} id={index}>
                    <Icon className={css({ marginRight: '8px' })} />
                    <span className={css({ textStyle: 'h3' })}>{label}</span>
                  </Step>
                ))}
              </Stepper>
            </div>
            <div className={hstack()}>
              <h3 className={css({ textStyle: 'h3' })}>현 라운드 완료율</h3>
              <LinearProgress
                value={processValue}
                total={teamInfoList?.length ?? 0}
              />
            </div>
          </div>
        </nav>

        <section
          className={vstack({
            width: '100%',
            padding: '60px',
            gap: '48px',
            border: '1px solid rgba(255, 255, 255, 0.11)',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(50px)',
            borderRadius: '20px',
          })}
        >
          <div
            className={hstack({
              width: '100%',
              gap: '24px',
            })}
          >
            <h2
              className={css({
                textStyle: 'h1',
              })}
            >
              팀 빌딩 현황
            </h2>

            <p
              className={css({
                textStyle: 'p1',
                color: 'gray.10',
              })}
            >
              팀원 이름을 마우스로 호버하면 팀 재배정하거나, 해당 인원을 팀에서
              제거할 수 있습니다.
            </p>
          </div>

          <section
            className={vstack({
              width: '100%',
              alignItems: 'flex-start',
              gap: '24px',
            })}
          >
            <div className={hstack({ gap: '16px' })}>
              <Chip visual="first" label="1 지망" />
              <Chip visual="second" label="2 지망" />
              <Chip visual="third" label="3 지망" />
              <Chip visual="fourth" label="4 지망" />
              <Chip visual="extra" label="임의배정" />
              <Chip visual="pm" label="PM" />
            </div>

            <div
              className={css({
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(12, 13, 14, 0.50)',
                backdropFilter: 'blur(50px)',
                borderRadius: '20px',
              })}
            >
              <table
                className={css({
                  width: '100%',
                  fontSize: '16px',
                  color: 'gray.20',
                  '& tr': {
                    height: '52px',
                    borderBottom: '1px solid token(colors.gray.30)',
                  },
                  '& tbody tr:last-child': {
                    borderBottom: 'none',
                  },
                  '& thead tr': {
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.28)',
                  },
                  '& th': {
                    textAlign: 'left',
                    paddingLeft: '16px',
                  },
                  '& td': {
                    verticalAlign: 'top',
                  },
                  '& td:first-child': {
                    verticalAlign: 'middle',
                    paddingLeft: '16px',
                  },
                })}
              >
                <thead>
                  <tr>
                    <th>팀 이름</th>
                    <th className={css({ width: '160px' })}>디자이너</th>
                    <th className={css({ width: '160px' })}>프론트엔드</th>
                    <th className={css({ width: '160px' })}>백엔드</th>
                    <th className={css({ width: '160px' })}>iOS</th>
                    <th className={css({ width: '160px' })}>안드로이드</th>
                  </tr>
                </thead>
                <tbody>
                  {allMemberByTeam.map(([teamName, members]) => (
                    <tr key={teamName}>
                      <td>{teamName}</td>

                      <td>
                        <div
                          className={vstack({
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '8px',
                          })}
                        >
                          {members
                            .filter((user) => user.position === 'DESIGNER')
                            .map(renderUser)}
                        </div>
                      </td>

                      <td>
                        <div
                          className={vstack({
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '8px',
                          })}
                        >
                          {members
                            .filter((user) => user.position === 'FRONT_END')
                            .map(renderUser)}
                        </div>
                      </td>

                      <td>
                        <div
                          className={vstack({
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '8px',
                          })}
                        >
                          {members
                            .filter((user) => user.position === 'BACK_END')
                            .map(renderUser)}
                        </div>
                      </td>

                      <td>
                        <div
                          className={vstack({
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '8px',
                          })}
                        >
                          {members
                            .filter((user) => user.position === 'IOS')
                            .map(renderUser)}
                        </div>
                      </td>

                      <td>
                        <div
                          className={vstack({
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '8px',
                          })}
                        >
                          {members
                            .filter((user) => user.position === 'ANDROID')
                            .map(renderUser)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={css({ width: '100%', textAlign: 'right' })}>
            <Button
              size="medium"
              color="primary"
              title={
                !canFinishTeamBuilding
                  ? '팀 구성 조정 라운드에서 모든 팀에 인원 배정이 완료되어야 종료할 수 있습니다.'
                  : undefined
              }
              disabled={!canFinishTeamBuilding}
              onClick={handleClickFinishTeamBuilding}
              className={css({
                width: '320px !important',
              })}
            >
              팀 빌딩 마치기
            </Button>
          </section>
        </section>
      </section>

      <SelectTeamModal
        isOpen={selectTeamModalProps.isOpen}
        teams={teamInfoList ?? []}
        onClose={handleCloseModal}
        onSelect={handleSelectTeam}
      />
      <ShareSurveyModal
        teamBuildingUuid={teamBuildingUuid}
        isOpen={shareSurveyModalProps.isOpen}
        onClose={shareSurveyModalProps.onClose}
      />
    </>
  );
};
