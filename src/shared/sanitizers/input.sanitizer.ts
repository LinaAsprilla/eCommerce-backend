/**
 * Input Sanitizer - OWASP A03:2021 Injection Prevention
 * Sanitizes user input to prevent XSS and injection attacks
 */
export class InputSanitizer {
  /**
   * Remove potentially dangerous HTML/script tags
   */
  static sanitizeString(input: string): string {
    if (!input) return input;

    return input
      .replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replaceAll(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replaceAll(/javascript:/gi, '')
      .replaceAll(/on\w+\s*=/gi, '')
      .trim();
  }


  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeString(sanitized[key]) as any;
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }
}
