import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongooseError } from 'mongoose';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = this.getMessage(exception);

    this.logger.error(
      `Status: ${status} | Method: ${request.method} | URL: ${request.url} | Error: ${message}`,
      exception.stack,
    );

    if (exception instanceof BadRequestException) {
      return response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof MongooseError) {
      return response.status(400).json({
        statusCode: 400,
        message: 'Database error occurred.',
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private getMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response['message']) {
      return Array.isArray(response['message'])
        ? response['message'].join(', ')
        : response['message'];
    }

    return 'An unexpected error occurred.';
  }
}
