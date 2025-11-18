import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test/path',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };
  });

  describe('catch', () => {
    it('should catch and format HTTP exceptions', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          path: '/test/path',
        }),
      );
    });

    it('should include timestamp in error response', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      const before = new Date();

      filter.catch(exception, mockHost as ArgumentsHost);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = new Date(callArgs.timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should handle exceptions with object response', () => {
      const responseObject = {
        message: 'Validation failed',
        errors: ['field1 is required'],
      };

      const exception = new HttpException(responseObject, HttpStatus.UNPROCESSABLE_ENTITY);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
        }),
      );
    });

    it('should handle exceptions with string response', () => {
      const exception = new HttpException('String error', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String error',
        }),
      );
    });

    it('should return generic message for 500 errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const exception = new HttpException('Real error message', HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not hide error details for non-500 errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const exception = new HttpException('Validation error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation error',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should show real error message for 500 errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const exception = new HttpException('Real error message', HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Real error message',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle different HTTP status codes', async () => {
      const statusCodes = [
        HttpStatus.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.CONFLICT,
        HttpStatus.TOO_MANY_REQUESTS,
      ];

      for (const status of statusCodes) {
        const exception = new HttpException(`Error ${status}`, status);

        filter.catch(exception, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
      }
    });

    it('should use fallback message when response has no message property', () => {
      const responseObject = {
        error: 'Some error',
        // no message property
      };

      const exception = new HttpException(responseObject, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        }),
      );
    });

    it('should include request path in error response', () => {
      const exception = new HttpException('Error', HttpStatus.NOT_FOUND);

      mockRequest.url = '/api/products/123';

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/products/123',
        }),
      );
    });

    it('should preserve HTTP status code in response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost as ArgumentsHost);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
