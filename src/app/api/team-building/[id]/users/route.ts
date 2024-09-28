import { createUserAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const POST = helper<{ id: string }>(async (request, { params }) => {
  const body = await request.json();
  return await createUserAction({
    teamBuildingUuid: params.id,
    body,
  });
});
