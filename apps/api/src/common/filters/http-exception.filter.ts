import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as any;

        message = resObj.message || exception.message;

        code = resObj.code || 'HTTP_EXCEPTION';
        // Nest validation pipe returns arrays of validation errors in message field.
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join(', ');
          code = 'VALIDATION_ERROR';
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const requestId = request['id'] || 'N/A';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[Request ID: ${requestId}] Internal Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[Request ID: ${requestId}] Client Exception (Status ${status}): ${message}`,
      );
    }

    response.status(status).json({
      status,
      message,
      code,
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}
