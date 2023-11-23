import { Meta } from './meta';

export type SuccessResponse<T> = {
  meta: Meta<'success'>;
  data: T;
};
