export type Meta<T extends 'failure' | 'success'> = {
  type: T;
  correlationId: string;
  statusCode: number;
  timestamp: string;
  path: string;
};
