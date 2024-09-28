import { createTeamBuildingAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const POST = helper(async (request) => {
  const body = await request.json();
  return await createTeamBuildingAction({ body });
});
