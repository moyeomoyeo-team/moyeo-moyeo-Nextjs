import { useEffect } from 'react';

import toast from 'react-hot-toast';

import { Round, Team, TotalInfo, User } from '@/types';
import { ROUND_LABEL_MAP } from '@/utils/const';
import { playSound } from '@/utils/sound';
import { toastWithSound } from '@/utils/toast';

import { usePrevious } from './usePrevious';

export const useTotalInfoNotification = (totalInfo?: TotalInfo) => {
  const prevTotalInfo = usePrevious(totalInfo);

  useEffect(() => {
    const prev = prevTotalInfo;
    const current = totalInfo;
    if (!prev || !current) return;

    const toastAboutChangeRound = (roundStatus: Round) => {
      if (roundStatus === 'START') {
        playSound('라운드_변경');
        toast.success('모든 준비가 완료되면 팀 빌딩을 시작해주세요.');
      } else if (roundStatus === 'COMPLETE') {
        playSound('팀빌딩_완료');
        toast.success('팀 빌딩이 완료되었습니다.');
      } else {
        playSound('라운드_변경');
        toast.success(
          `${ROUND_LABEL_MAP[roundStatus]} 라운드가 시작되었습니다.`,
        );
      }
    };

    const toastAboutSelectDone = (prevTeams: Team[], currentTeams: Team[]) => {
      const newlySelectedTeams = currentTeams.filter(
        (team) =>
          team.selectDone &&
          prevTeams.some(
            (prevTeam) => prevTeam.uuid === team.uuid && !prevTeam.selectDone,
          ),
      );
      if (newlySelectedTeams.length === 0) return;

      const firstTeamName = newlySelectedTeams[0].teamName;
      toastWithSound.success(
        newlySelectedTeams.length > 1
          ? // prettier-ignore
            `${firstTeamName}팀 외 ${newlySelectedTeams.length - 1}팀이 팀원 선택을 완료했습니다.`
          : `${firstTeamName}팀이 팀원 선택을 완료했습니다.`,
      );
    };

    const toastAboutSurveyDone = (prevUsers: User[], currentUsers: User[]) => {
      const newlySurveyDoneUsers = currentUsers.filter((user) =>
        prevUsers.every((prevUser) => prevUser.uuid !== user.uuid),
      );
      if (newlySurveyDoneUsers.length === 0) return;

      const firstUserName = newlySurveyDoneUsers[0].userName;
      toastWithSound.success(
        newlySurveyDoneUsers.length > 1
          ? // prettier-ignore
            `${firstUserName}님 외 ${newlySurveyDoneUsers.length - 1}명의 설문 응답이 등록되었습니다.`
          : `${firstUserName}님의 설문 응답이 등록되었습니다.`,
      );
    };

    const roundStatusChanged =
      prev.teamBuildingInfo.roundStatus !==
      current.teamBuildingInfo.roundStatus;

    if (roundStatusChanged) {
      toastAboutChangeRound(current.teamBuildingInfo?.roundStatus);
      return;
    }

    // 선택 완료한 팀이 있는 경우
    if (current.teamBuildingInfo.roundStatus !== 'COMPLETE') {
      toastAboutSelectDone(prev.teamInfoList, current.teamInfoList);
    }

    // 설문 응답 완료한 경우
    if (current.teamBuildingInfo.roundStatus === 'START') {
      toastAboutSurveyDone(prev.userInfoList, current.userInfoList);
    }
  }, [prevTotalInfo, totalInfo]);
};
