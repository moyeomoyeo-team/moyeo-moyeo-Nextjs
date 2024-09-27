import { useMutation } from '@tanstack/react-query';

import {
  adjustUserAction,
  createTeamBuildingAction,
  deleteUserAction,
  finishTeamBuildingAction,
  moveToNextRoundAction,
  startTeamBuildingAction,
} from '@/actions';

import { API } from '../type';

export const useCreateTeamBuilding = () => {
  type Response = API['createTeamBuilding']['response'];
  type Request = API['createTeamBuilding']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await createTeamBuildingAction(payload);
    },
  });
};

export const useStartTeamBuilding = () => {
  type Response = API['startTeamBuilding']['response'];
  type Request = API['startTeamBuilding']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await startTeamBuildingAction(payload);
    },
  });
};

export const useMoveToNextRound = () => {
  type Response = API['moveToNextRound']['response'];
  type Request = API['moveToNextRound']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await moveToNextRoundAction(payload);
    },
  });
};

export const useAdjustUser = () => {
  type Response = API['adjustUser']['response'];
  type Request = API['adjustUser']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await adjustUserAction(payload);
    },
  });
};

export const useDeleteUser = () => {
  type Response = API['deleteUser']['response'];
  type Request = API['deleteUser']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await deleteUserAction(payload);
    },
  });
};

export const useFinishTeamBuilding = () => {
  type Response = API['finishTeamBuilding']['response'];
  type Request = API['finishTeamBuilding']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await finishTeamBuildingAction(payload);
    },
  });
};
