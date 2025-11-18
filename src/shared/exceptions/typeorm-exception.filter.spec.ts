import { TypeOrmExceptionFilter } from './typeorm-exception.filter';
import { QueryFailedError } from 'typeorm';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('TypeOrmExceptionFilter', () => {
  let filter: TypeOrmExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new TypeOrmExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  describe('catch', () => {
    it('should catch and format QueryFailedError exceptions', () => {
      const exception = new QueryFailedError(
        'SELECT * FROM users',
        [],
        new Error('Connection failed')
      );

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database error'
      });
    });

    it('should return BAD_REQUEST status code', () => {
      const exception = new QueryFailedError(
        'DELETE FROM products',
        [],
        new Error('Foreign key constraint')
      );

      filter.catch(exception, mockHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return consistent error message', () => {
      const exception1 = new QueryFailedError(
        'INSERT INTO users',
        [],
        new Error('Duplicate entry')
      );

      const exception2 = new QueryFailedError(
        'UPDATE products',
        [],
        new Error('Column not found')
      );

      filter.catch(exception1, mockHost as ArgumentsHost);
      const firstCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      mockResponse.json = jest.fn();
      filter.catch(exception2, mockHost as ArgumentsHost);
      const secondCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(firstCall.message).toBe(secondCall.message);
    });

    it('should return consistent statusCode', () => {
      const exception = new QueryFailedError(
        'SELECT * FROM transactions',
        [],
        new Error('Connection timeout')
      );

      filter.catch(exception, mockHost as ArgumentsHost);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should have proper error response structure', () => {
      const exception = new QueryFailedError(
        'SELECT id FROM orders',
        [],
        new Error('Table does not exist')
      );

      filter.catch(exception, mockHost as ArgumentsHost);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveProperty('statusCode');
      expect(callArgs).toHaveProperty('message');
      expect(Object.keys(callArgs)).toEqual(['statusCode', 'message']);
    });
  });
});
