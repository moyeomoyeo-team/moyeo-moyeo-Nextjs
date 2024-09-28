import { adjustUserAction, deleteUserAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const POST = helper<{ id: string; userid: string }>(
  async (request, { params }) => {
    const body = await request.json();
    return await adjustUserAction({
      teamBuildingUuid: params.id,
      userUuid: params.userid,
      body,
    });
  },
);

export const DELETE = helper<{ id: string; userid: string }>(
  async (_, { params }) => {
    return await deleteUserAction({
      teamBuildingUuid: params.id,
      userUuid: params.userid,
    });
  },
);
