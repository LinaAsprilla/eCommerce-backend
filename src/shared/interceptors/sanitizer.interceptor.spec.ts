import { Test, TestingModule } from '@nestjs/testing';
import { SanitizerInterceptor } from './sanitizer.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SanitizerInterceptor', () => {
  let interceptor: SanitizerInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanitizerInterceptor],
    }).compile();

    interceptor = module.get<SanitizerInterceptor>(SanitizerInterceptor);
  });

  describe('intercept', () => {
    it('should sanitize request body', () => {
      const mockRequest = {
        body: {
          name: 'User<script>alert(1)</script>',
          email: 'user@example.com',
        },
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.body.name).not.toContain('<script>');
      expect(mockRequest.body.email).toBe('user@example.com');
    });

    it('should sanitize request query parameters', () => {
      const mockRequest = {
        body: {},
        query: {
          search: 'test<iframe></iframe>',
          filter: 'value',
        },
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.query.search).not.toContain('<iframe');
      expect(mockRequest.query.filter).toBe('value');
    });

    it('should sanitize request params', () => {
      const mockRequest = {
        body: {},
        query: {},
        params: {
          id: '123<script>alert(1)</script>',
          action: 'delete',
        },
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.params.id).not.toContain('<script>');
      expect(mockRequest.params.action).toBe('delete');
    });

    it('should handle missing body, query, and params', () => {
      const mockRequest = {};

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      expect(() => {
        interceptor.intercept(mockExecutionContext, mockCallHandler);
      }).not.toThrow();
    });

    it('should handle non-object body', () => {
      const mockRequest = {
        body: 'plain text',
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.body).toBe('plain text');
    });

    it('should call next.handle()', () => {
      const mockRequest = {
        body: {},
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should sanitize nested body objects', () => {
      const mockRequest = {
        body: {
          user: {
            profile: {
              bio: 'Bio<script>alert(1)</script>',
            },
          },
        },
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.body.user.profile.bio).not.toContain('<script>');
    });

    it('should sanitize multiple dangerous patterns', () => {
      const mockRequest = {
        body: {
          field1: 'text<script>alert(1)</script>',
          field2: 'text<iframe src="x"></iframe>',
          field3: 'text<img onclick="evil()" src="x">',
        },
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.body.field1).not.toContain('<script>');
      expect(mockRequest.body.field2).not.toContain('<iframe');
      expect(mockRequest.body.field3).not.toMatch(/onclick=/);
    });

    it('should return observable from next.handle()', (done) => {
      const mockRequest = {
        body: {},
        query: {},
        params: {},
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockResponse = { success: true };
      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(mockResponse)),
      } as unknown as CallHandler;

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
    });
  });
});
