import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { correlationIdProvider } from '../hooks/correlationId';

@Injectable()
export class CorrelationIdSetter implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    correlationIdProvider.bindEmitter(req);
    correlationIdProvider.bindEmitter(res);
    correlationIdProvider.bindEmitter(req.socket);

    correlationIdProvider.withCorrelationId(() => {
      const correlationId: string = correlationIdProvider.getCorrelationId();
      res.set('x-correlation-id', correlationId);
      next();
    }, req.get('x-correlation-id'));
  }
}
