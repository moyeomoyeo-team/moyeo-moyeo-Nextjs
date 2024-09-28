import { moveToNextRoundAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const PUT = helper<{ id: string }>(async (request, { params }) => {
  const body = await request.json();
  return await moveToNextRoundAction({
    teamBuildingUuid: params.id,
    body,
  });
});
