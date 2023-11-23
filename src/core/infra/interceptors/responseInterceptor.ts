import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../types/successResponse';
import { correlationIdProvider } from '../hooks/correlationId';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<unknown>> {
    const ctx: HttpArgumentsHost = context.switchToHttp();

    return next.handle().pipe(
      map((data: T) => {
        return {
          meta: {
            correlationId: correlationIdProvider.getCorrelationId(),
            type: 'success',
            statusCode: ctx.getResponse().statusCode,
            timestamp: new Date().toISOString(),
            path: ctx.getRequest().url,
          },
          data: data || null,
        };
      }),
    );
  }
}
