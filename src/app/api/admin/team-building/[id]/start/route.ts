import { startTeamBuildingAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const PUT = helper<{ id: string }>(async (_, { params }) => {
  return await startTeamBuildingAction({
    teamBuildingUuid: params.id,
  });
});
