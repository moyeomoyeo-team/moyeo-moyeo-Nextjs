import { getTotalInfoForSurveyAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const GET = helper<{ id: string }>(async (_, { params }) => {
  return await getTotalInfoForSurveyAction({
    teamBuildingUuid: params.id,
  });
});
