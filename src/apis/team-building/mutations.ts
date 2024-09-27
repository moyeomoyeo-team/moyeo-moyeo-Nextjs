import { DefaultError, useMutation } from '@tanstack/react-query';

import { selectUsersAction } from '@/actions';

import { API } from '../type';

export const useSelectUsers = () => {
  type Request = API['selectUsers']['request'];
  type Response = API['selectUsers']['response'];

  return useMutation<Response, DefaultError, Request>({
    mutationFn: async (payload) => {
      return await selectUsersAction(payload);
    },
  });
};
