import { healthCheckAction } from '@/actions';
import { helper } from '@/utils/api-route';

export const GET = helper(async () => {
  return await healthCheckAction();
});
