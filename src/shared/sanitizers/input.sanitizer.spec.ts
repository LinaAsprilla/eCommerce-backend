import { InputSanitizer } from './input.sanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove iframe tags', () => {
      const input = 'Content <iframe src="evil.com"></iframe> Safe';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('</iframe>');
      expect(result).toContain('Content');
      expect(result).toContain('Safe');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Click me</a>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(1)" onload="malicious()">';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('onerror=');
      expect(result).not.toContain('onload=');
      expect(result).not.toMatch(/on\w+\s*=/);
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).toBe('Hello World');
    });

    it('should return input as-is for null/undefined/empty', () => {
      expect(InputSanitizer.sanitizeString('')).toBe('');
      expect(InputSanitizer.sanitizeString(null as any)).toBe(null);
      expect(InputSanitizer.sanitizeString(undefined as any)).toBe(undefined);
    });

    it('should handle multiple script tags', () => {
      const input = '<script>alert(1)</script>Safe<script>alert(2)</script>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('Safe');
    });

    it('should handle nested tags', () => {
      const input = '<script><div>content</div></script>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should preserve safe HTML', () => {
      const input = '<p>Hello <b>World</b></p>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<b>');
      expect(result).toContain('</b>');
      expect(result).toContain('</p>');
    });

    it('should handle case-insensitive script tags', () => {
      const input = '<SCRIPT>alert(1)</SCRIPT>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('alert');
    });

    it('should handle spaces in tags', () => {
      const input = '<script   >alert(1)</script>';
      const result = InputSanitizer.sanitizeString(input);

      expect(result).not.toContain('alert');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string properties', () => {
      const obj = {
        name: 'User<script>alert(1)</script>',
        email: 'user@example.com',
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.name).not.toContain('<script>');
      expect(result.email).toBe('user@example.com');
    });

    it('should sanitize nested objects', () => {
      const obj = {
        user: {
          name: 'Test<script>alert(1)</script>',
          profile: {
            bio: 'Bio<iframe src="evil"></iframe>',
          },
        },
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.user.name).not.toContain('<script>');
      expect(result.user.profile.bio).not.toContain('<iframe');
    });

    it('should preserve non-string properties', () => {
      const obj = {
        name: 'John',
        age: 30,
        active: true,
        score: 95.5,
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.score).toBe(95.5);
    });

    it('should handle arrays of strings', () => {
      const obj = {
        tags: ['safe', 'unsafe<script></script>'],
      };

      const result = InputSanitizer.sanitizeObject(obj);

      // Arrays are objects, so it will iterate through them
      expect(result.tags[0]).toBe('safe');
    });

    it('should not modify original object', () => {
      const original = {
        text: 'Hello<script>alert(1)</script>World',
      };

      const originalText = original.text;
      InputSanitizer.sanitizeObject(original);

      expect(original.text).toBe(originalText);
    });

    it('should handle empty objects', () => {
      const obj = {};
      const result = InputSanitizer.sanitizeObject(obj);

      expect(result).toEqual({});
    });

    it('should handle null values in object', () => {
      const obj = {
        name: 'Test',
        value: null,
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.name).toBe('Test');
      expect(result.value).toBeNull();
    });

    it('should sanitize multiple event handlers', () => {
      const obj = {
        html: '<img onclick="malicious()" onmouseover="bad()" src="x">',
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.html).not.toMatch(/on\w+\s*=/);
    });

    it('should handle objects with undefined values', () => {
      const obj = {
        name: 'Test',
        optional: undefined,
      };

      const result = InputSanitizer.sanitizeObject(obj);

      expect(result.name).toBe('Test');
      expect(result.optional).toBeUndefined();
    });
  });
});
