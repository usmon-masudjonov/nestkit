import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { FailedResponse } from '../types/failedResponse';
import { LoggerService } from '../logger/logger.service';
import { correlationIdProvider } from '../hooks/correlationId';
import { ClassValidatorException } from './types/classValidatorException';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: Error | ClassValidatorException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx: HttpArgumentsHost = host.switchToHttp();

    const httpStatus: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = exception.message;

    if (this.isClassValidatorException(exception)) {
      message = exception.response.message;
    }

    const responseBody: FailedResponse = {
      meta: {
        correlationId: correlationIdProvider.getCorrelationId(),
        type: 'failure',
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      },
      message: message,
    };

    this.logger.error(exception.message, exception.name, exception.stack);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private isClassValidatorException(
    exception: Error,
  ): exception is ClassValidatorException {
    return exception instanceof BadRequestException && 'response' in exception;
  }
}
