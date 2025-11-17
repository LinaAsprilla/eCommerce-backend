import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InputSanitizer } from '../sanitizers/input.sanitizer';

/**
 * Global Sanitizer Interceptor - OWASP A03:2021 Injection Prevention
 * Automatically sanitizes all incoming request bodies, query params, and route params
 */
@Injectable()
export class SanitizerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      request.body = InputSanitizer.sanitizeObject(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = InputSanitizer.sanitizeObject(request.query);
    }

    if (request.params && typeof request.params === 'object') {
      request.params = InputSanitizer.sanitizeObject(request.params);
    }

    return next.handle();
  }
}
