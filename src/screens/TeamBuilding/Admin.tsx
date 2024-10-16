import { useLayoutEffect, useMemo, useState } from 'react';

import { Tooltip } from 'react-tooltip';

import {
  useAdjustUser,
  useDeleteUser,
  useFinishTeamBuilding,
  useMoveToNextRound,
  useStartTeamBuilding,
} from '@/apis/admin/mutations';
import { useGetTotalInfo } from '@/apis/team-building/queries';
import CheckWithoutCircleIcon from '@/assets/icons/checkWithoutCircle.svg';
import Face from '@/assets/icons/face.svg';
import Group from '@/assets/icons/group.svg';
import InfoOutline from '@/assets/icons/infoOutline.svg';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ChipWithUser } from '@/components/ChipWithUser';
import { LinearProgress } from '@/components/LinearProgress';
import { Step, Stepper } from '@/components/stepper';
import { useDisclosure } from '@/hooks/useDisclosure';
import { SelectTeamModal } from '@/modals/SelectTeamModal';
import { ShareSurveyModal } from '@/modals/ShareSurveyModal';
import { ConfirmModal } from '@/modals/common/ConfirmModal';
import { css } from '@/styled-system/css';
import { center, hstack, stack, vstack } from '@/styled-system/patterns';
import { Team, User } from '@/types';
import { POSITION, ROUND_INDEX_MAP } from '@/utils/const';
import { downloadTsv } from '@/utils/file';
import { toLocaleString } from '@/utils/format';
import { getNextRound } from '@/utils/round';
import { toastWithSound } from '@/utils/toast';

import { useTotalInfoNotification } from '../../hooks/useTotalInfoNotification';

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

export type AdminProps = {
  teamBuildingUuid: string;
};

export const Admin = ({ teamBuildingUuid }: AdminProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const selectTeamModalProps = useDisclosure();
  const shareSurveyModalProps = useDisclosure();
  const startConfirmModalProps = useDisclosure();
  const finishConfirmModalProps = useDisclosure();

  const {
    data: totalInfo,
    refetch: refetchTotalInfo,
    setTotalInfo,
  } = useGetTotalInfo(teamBuildingUuid, true);
  const { teamBuildingInfo, teamInfoList, userInfoList } = totalInfo ?? {};
  useTotalInfoNotification(totalInfo);

  const { mutate: adjustUser } = useAdjustUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: startTeamBuilding, isPending: isLoadingToStart } =
    useStartTeamBuilding();
  const { mutate: finishTeamBuilding, isPending: isLoadingToFinish } =
    useFinishTeamBuilding();
  const { mutate: moveToNextRound, isPending: isLoadingToNextRound } =
    useMoveToNextRound();

  const activeStep =
    ROUND_INDEX_MAP[teamBuildingInfo?.roundStatus ?? 'FIRST_ROUND'];
  const processValue = (teamInfoList ?? []).reduce(
    (acc, team) => (acc += team.selectDone ? 1 : 0),
    0,
  );
  const isAllTeamsSelectDone = useMemo(
    () => teamInfoList?.every((team) => team.selectDone) ?? false,
    [teamInfoList],
  );
  const isFinishedTeamBuilding = teamBuildingInfo?.roundStatus === 'COMPLETE';
  const isDisabledFinishTeamBuildingButton = useMemo(() => {
    if (teamBuildingInfo?.roundStatus !== 'ADJUSTED_ROUND') return true;
    return userInfoList?.some((user) => user.joinedTeamUuid === null) ?? false;
  }, [teamBuildingInfo?.roundStatus, userInfoList]);

  const allMemberByTeam = useMemo(() => {
    const allMemberByTeam: Record<Team['uuid'], User[]> = {};

    teamInfoList?.forEach((team) => {
      allMemberByTeam[team.uuid] = [
        {
          uuid: 'pm',
          userName: team.pmName,
          position: team.pmPosition,
          choices: [],
          joinedTeamUuid: team.uuid,
          profileLink: '',
          selectedRound: 'FIRST_ROUND',
          createdDate: '',
        } as User,
        ...(userInfoList ?? []).filter(
          (user) => user.joinedTeamUuid === team.uuid,
        ),
      ];
    });

    allMemberByTeam['others'] = (userInfoList ?? []).filter(
      (user) => user.joinedTeamUuid === null,
    );

    return Object.entries(allMemberByTeam);
  }, [teamInfoList, userInfoList]);

  const guideText = useMemo(() => {
    switch (teamBuildingInfo?.roundStatus) {
      case 'START':
        return {
          title: '설문 제출 현황',
          description:
            '아래는 제출된 설문 결과 현황입니다. [설문 제출 완료 > PM 입장 > PM 팀 빌딩 동의] 이후 팀 빌딩 시작하기를 눌러주세요',
        };
      default:
        return {
          title: '팀 빌딩 현황',
          description:
            '팀원 이름을 마우스로 호버하면 팀 재배정하거나, 해당 인원을 팀에서 제거할 수 있습니다.',
        };
    }
  }, [teamBuildingInfo?.roundStatus]);

  const handleClickDownload = () => {
    const teamNameMap = (teamInfoList ?? []).reduce(
      (teamNameMap, team) => {
        // @note: 팀 아이디어 이름과 pm 이름을 합쳐서 알기 쉽게 한다
        teamNameMap[team.uuid] = `${team.pmName}팀: ${team.teamName}`;
        return teamNameMap;
      },
      {} as Record<Team['uuid'], string>,
    );

    // @note: 현재 정보를 tsv 파일로 다운로드
    const fileName = `${teamBuildingInfo?.teamBuildingName}-${teamBuildingUuid}`;
    const fileContent = [
      [
        'uuid',
        '이름',
        '직군',
        '선택된 팀',
        '선택된 라운드',
        '1지망',
        '2지망',
        '3지망',
        '4지망',
        '설문제출시간',
      ],
      // @note: allMemberByTeam를 사용하면 pm 정보도 자연스럽게 같이 들어가게 된다
      ...allMemberByTeam.flatMap(([teamUuid, members]) => {
        return members.map((member) => [
          member.uuid,
          member.userName,
          POSITION[member.position],
          teamNameMap[teamUuid] || '-',
          member.selectedRound || '-',
          ...member.choices.map((choice) => teamNameMap[choice] || '-'),
          toLocaleString(member.createdDate),
        ]);
      }),
    ];

    downloadTsv(fileName, fileContent);
  };

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
            setTotalInfo((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                userInfoList: prev.userInfoList.map((user) => {
                  if (user.uuid === selectedUser.uuid) {
                    return {
                      ...user,
                      selectedRound: null,
                      joinedTeamUuid: null,
                    };
                  }
                  return user;
                }),
              };
            });

            toastWithSound.success(
              `${selectedUser.userName}님의 팀 배정을 해제했습니다.`,
            );
          },
          onError: () => {
            toastWithSound.error(
              '팀 배정 해제에 실패했습니다. 잠시 후 다시 시도해주세요.',
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
            setTotalInfo((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                userInfoList: prev.userInfoList.map((user) => {
                  if (user.uuid === selectedUser.uuid) {
                    return {
                      ...user,
                      selectedRound: 'ADJUSTED_ROUND',
                      joinedTeamUuid: team.uuid,
                    };
                  }
                  return user;
                }),
              };
            });

            toastWithSound.success(
              `${selectedUser.userName}님을 ${team.pmName}팀으로 배정했습니다.`,
            );
          },
          onError: () => {
            toastWithSound.error(
              '팀 배정에 실패했습니다. 잠시 후 다시 시도해주세요.',
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

  const handleClickStartTeamBuilding = () => {
    startTeamBuilding(
      { teamBuildingUuid },
      {
        onSuccess: () => {
          // @note: refetch 되기 전까지 선반영
          setTotalInfo((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              teamBuildingInfo: {
                ...prev.teamBuildingInfo,
                roundStatus: 'FIRST_ROUND',
              },
            };
          });
          refetchTotalInfo();
        },
        onError: () => {
          toastWithSound.error(
            '팀 빌딩을 시작하는데 실패했습니다. 잠시 후 다시 시도해주세요.',
          );
        },
      },
    );
  };

  const handleClickMoveToNextRound = () => {
    if (!teamBuildingInfo) return;

    const nextRound = getNextRound(teamBuildingInfo.roundStatus);

    moveToNextRound(
      {
        teamBuildingUuid,
        body: { nextRound },
      },
      {
        onSuccess: () => {
          // @note: refetch 되기 전까지 disabled 되어있도록 먼저 반영
          setTotalInfo((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              teamBuildingInfo: {
                ...prev.teamBuildingInfo,
                roundStatus: nextRound,
              },
              teamInfoList: prev.teamInfoList.map((team) => {
                if (team.selectDone) {
                  return {
                    ...team,
                    selectDone: false,
                  };
                }
                return team;
              }),
            };
          });
          refetchTotalInfo();
        },
        onError: () => {
          toastWithSound.error(
            '다음 라운드로 이동하는데 실패했습니다. 잠시 후 다시 시도해주세요.',
          );
        },
      },
    );
  };

  const handleClickFinishTeamBuilding = () => {
    finishTeamBuilding(
      {
        teamBuildingUuid,
      },
      {
        onSuccess: () => {
          // @note: refetch 되기 전까지 disabled 되어있도록 먼저 반영
          setTotalInfo((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              teamBuildingInfo: {
                ...prev.teamBuildingInfo,
                roundStatus: 'COMPLETE',
              },
            };
          });
          refetchTotalInfo();
        },
        onError: () => {
          toastWithSound.error(
            '팀 빌딩을 완료하는데 실패했습니다. 잠시 후 다시 시도해주세요.',
          );
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

  const renderTeamTitle = (teamUuid: Team['uuid']) => {
    const team = teamInfoList?.find((team) => team.uuid === teamUuid);
    const showCheck = team?.selectDone ?? false;

    return (
      <div className={css({ padding: '16px 0', textStyle: 'p2' })}>
        {team ? (
          <div className={stack({ gap: '8px' })}>
            <div className={hstack({ textStyle: 'h4' })}>
              {team.pmName}
              {showCheck && (
                <div
                  title="이번 라운드 팀원 선택을 완료했습니다."
                  className={center({
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: 'green.70',
                    '& svg': {
                      width: '16px',
                      height: '16px',
                    },
                  })}
                >
                  <CheckWithoutCircleIcon />
                </div>
              )}
            </div>
            <div>{team.teamName}</div>
          </div>
        ) : (
          '남은 인원'
        )}
      </div>
    );
  };

  const renderUser = (selectUser: User) => {
    return (
      <ChipWithUser
        key={selectUser.uuid}
        user={selectUser}
        isShowButton={selectUser.uuid !== 'pm' && !isFinishedTeamBuilding}
        onClickReassign={() => {
          if (teamBuildingInfo?.roundStatus !== 'ADJUSTED_ROUND') {
            return toastWithSound.error(
              '팀 구성 조정 라운드에서만 팀 재배정이 가능합니다.',
            );
          }

          setSelectedUser(selectUser);
          selectTeamModalProps.onOpen();
          // 이후 로직은 handleSelectTeam에서 처리됨.
        }}
        onClickDelete={() => {
          if (teamBuildingInfo?.roundStatus !== 'FIRST_ROUND') {
            return toastWithSound.error(
              '1지망 라운드에서만 유저 정보를 삭제할 수 있습니다.\n배정 해제는 재배정 버튼을 눌러주세요.',
            );
          }

          if (confirm(`${selectUser.userName}님을 삭제하시겠습니까?`)) {
            deleteUser(
              { teamBuildingUuid, userUuid: selectUser.uuid },
              {
                onSuccess: () => {
                  setTotalInfo((prev) =>
                    prev
                      ? {
                          ...prev,
                          userInfoList: prev.userInfoList.filter(
                            (user) => user.uuid !== selectUser.uuid,
                          ),
                        }
                      : prev,
                  );
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

  const renderCTAButton = () => {
    if (!teamBuildingInfo) return null;

    if (teamBuildingInfo.roundStatus === 'START') {
      return (
        <Button
          size="medium"
          color="primary"
          disabled={isLoadingToStart}
          onClick={startConfirmModalProps.onOpen}
          className={css({
            width: '320px !important',
          })}
        >
          {isLoadingToStart ? '시작하고 있습니다...' : '팀 빌딩 시작하기'}
        </Button>
      );
    }

    if (
      teamBuildingInfo.roundStatus === 'ADJUSTED_ROUND' ||
      teamBuildingInfo.roundStatus === 'COMPLETE'
    ) {
      return (
        <Button
          size="medium"
          color="primary"
          title={
            !isFinishedTeamBuilding && isDisabledFinishTeamBuildingButton
              ? '팀 구성 조정 라운드에서 모든 팀에 인원 배정이 완료되어야 종료할 수 있습니다.'
              : undefined
          }
          disabled={isLoadingToFinish || isDisabledFinishTeamBuildingButton}
          onClick={finishConfirmModalProps.onOpen}
          className={css({
            width: '320px !important',
          })}
        >
          {isFinishedTeamBuilding
            ? '팀 빌딩이 완료되었습니다'
            : '팀 빌딩 마치기'}
        </Button>
      );
    }

    return (
      <Button
        size="medium"
        color="primary"
        title={
          !isAllTeamsSelectDone
            ? '모든 팀이 선택을 마쳐야 다음 라운드로 넘어갈 수 있습니다.'
            : undefined
        }
        disabled={isLoadingToNextRound || !isAllTeamsSelectDone}
        onClick={handleClickMoveToNextRound}
        className={css({
          width: '320px !important',
        })}
      >
        {isLoadingToNextRound
          ? '다음 라운드로 넘어가는 중...'
          : '이번 라운드 마치기'}
      </Button>
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
            gap: '16px',
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
            <div className={hstack({ gap: '36px' })}>
              <div className={hstack({ gap: '12px' })}>
                <h4 className={hstack({ gap: '4px', textStyle: 'h4' })}>
                  현황 저장
                  <div
                    data-tooltip-id="download-helper"
                    className={css({ cursor: 'pointer' })}
                  >
                    <InfoOutline />
                  </div>
                </h4>
                <button
                  className={css({
                    width: '116px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.13)',
                    textStyle: 'h4',
                    color: 'gray.20',
                    cursor: 'pointer',
                  })}
                  onClick={handleClickDownload}
                >
                  TSV 다운로드
                </button>
              </div>
              <div className={hstack({ gap: '12px' })}>
                <h4 className={css({ textStyle: 'h4' })}>링크 공유</h4>
                <button
                  className={css({
                    width: '116px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.13)',
                    textStyle: 'h4',
                    color: 'gray.20',
                    cursor: 'pointer',
                  })}
                  onClick={handleClickShareSurvey}
                >
                  설문
                </button>
                <button
                  className={css({
                    width: '116px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.13)',
                    textStyle: 'h4',
                    color: 'gray.20',
                    cursor: 'pointer',
                  })}
                  onClick={handleClickShareLink}
                >
                  PM 입장
                </button>
              </div>
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
              {guideText.title}
            </h2>

            <p
              className={css({
                textStyle: 'p1',
                color: 'gray.10',
              })}
            >
              {guideText.description}
            </p>
          </div>

          <section
            className={vstack({
              width: '100%',
              alignItems: 'flex-start',
              gap: '24px',
            })}
          >
            <div className={hstack({ width: '100%', gap: '16px' })}>
              <Chip visual="first" label="1 지망" />
              <Chip visual="second" label="2 지망" />
              <Chip visual="third" label="3 지망" />
              <Chip visual="fourth" label="4 지망" />
              <Chip visual="adjust" label="임의배정" />
              <Chip visual="pm" label="PM" />
              <div className={css({ flex: 1, textAlign: 'right' })}>
                설문 제출 수 {userInfoList?.length} 명
              </div>
            </div>

            <div
              className={css({
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(12, 13, 14, 0.50)',
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
                  {allMemberByTeam.map(([teamUuid, members]) => (
                    <tr key={teamUuid}>
                      <td>{renderTeamTitle(teamUuid)}</td>

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
            {renderCTAButton()}
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
      {/* 팀 빌딩 시작 확인 모달 */}
      <ConfirmModal
        title="팀 빌딩을 시작할까요?"
        content={
          <>
            <p>
              시작하면 설문 제출이 불가능해요.
              <br />
              아래 항목을 확인한 후 팀 빌딩을 시작해주세요.
            </p>
            <p className={css({ marginTop: '20px' })}>
              1. 모든 인원이 설문을 제출했는지 한번 더 확인해주세요.
              <br />
              2. PM 전원이 링크 입장 후 팀 빌딩 동의를 완료했는지 확인해주세요.
            </p>
          </>
        }
        confirmButtonText="시작하기"
        isOpen={startConfirmModalProps.isOpen}
        onConfirm={handleClickStartTeamBuilding}
        onClose={startConfirmModalProps.onClose}
      />
      {/* 팀 빌딩 종료 확인 모달 */}
      <ConfirmModal
        title="팀 빌딩을 마칠까요?"
        content={
          <>
            모든 팀에 인원이 적절히 배정되었는지 확인해주세요.
            <br />팀 빌딩을 마치면 이 화면으로 다시 돌아올 수 없어요.
          </>
        }
        confirmButtonText="팀 빌딩 마치기"
        isOpen={finishConfirmModalProps.isOpen}
        onConfirm={handleClickFinishTeamBuilding}
        onClose={finishConfirmModalProps.onClose}
      />
      <Tooltip
        id="download-helper"
        place="bottom"
        content="현재까지 현황을 엑셀로 저장할 수 있어요"
        style={{
          zIndex: 9999,
          padding: '10px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#fff',
          backgroundColor: '#0C0C0E',
          borderRadius: '10px',
        }}
      />
    </>
  );
};
