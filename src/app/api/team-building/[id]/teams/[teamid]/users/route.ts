import { selectUsersAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const POST = helper<{ id: string; teamid: string }>(
  async (request, { params }) => {
    const body = await request.json();
    return await selectUsersAction({
      teamBuildingUuid: params.id,
      teamUuid: params.teamid,
      body,
    });
  },
);
