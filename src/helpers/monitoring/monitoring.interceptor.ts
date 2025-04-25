import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MonitoringInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;
    const userAgent = request.get('user-agent') || 'Unknown';
    const correlationKey = uuidv4();
    const userId = user?.userId || 'Anonymous';

    const logPrefix = `[${correlationKey}]`;

    this.logger.log(
      `${logPrefix} Incoming Request: ${method} ${url} | User: ${userId} | User-Agent: ${userAgent} | IP: ${ip}`,
    );

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const contentLength = response.get('content-length') || 'Unknown';

        const duration = Date.now() - start;

        this.logger.log(
          `${logPrefix} Response: ${method} ${url} | Status: ${statusCode} | Content-Length: ${contentLength} | Duration: ${duration}ms`,
        );
      }),
    );
  }
}
