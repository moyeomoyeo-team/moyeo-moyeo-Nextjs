import { useMutation } from '@tanstack/react-query';

import { createUserAction } from '@/actions';

import { API } from '../type';

export const useCreateUser = () => {
  type Response = API['createUser']['response'];
  type Request = API['createUser']['request'];

  return useMutation<Response, unknown, Request>({
    mutationFn: async (payload) => {
      return await createUserAction(payload);
    },
  });
};
