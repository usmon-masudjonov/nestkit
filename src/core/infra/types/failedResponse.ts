import { Meta } from './meta';

export type FailedResponse = {
  meta: Meta<'failure'>;
  message: string | string[];
};
