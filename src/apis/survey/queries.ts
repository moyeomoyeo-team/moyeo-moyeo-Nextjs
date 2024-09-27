import { useQuery } from '@tanstack/react-query';

import { getTotalInfoForSurveyAction } from '@/actions';

import { API } from '../type';

export const useGetTotalInfoForSurvey = (
  teamBuildingUuid?: API['getTotalInfoForSurvey']['request']['teamBuildingUuid'],
) => {
  type Response = API['getTotalInfoForSurvey']['response'];

  return useQuery<Response>({
    queryKey: ['survey', teamBuildingUuid],
    queryFn: async () => {
      if (!teamBuildingUuid) throw 'teamBuildingUuid is undefined';
      return await getTotalInfoForSurveyAction({ teamBuildingUuid });
    },
    enabled: !!teamBuildingUuid,
  });
};
