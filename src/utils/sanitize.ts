import DOMPurify from 'dompurify';
import { logger } from './logger';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
}

class ContentSanitizer {
  private static instance: ContentSanitizer;

  static getInstance(): ContentSanitizer {
    if (!ContentSanitizer.instance) {
      ContentSanitizer.instance = new ContentSanitizer();
    }
    return ContentSanitizer.instance;
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(content: string, options?: SanitizationOptions): string {
    try {
      const config: any = {
        ALLOWED_TAGS: options?.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'a'],
        ALLOWED_ATTR: options?.allowedAttributes || { 'a': ['href'] },
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
      };

      let sanitized = String(DOMPurify.sanitize(content, config));
      
      // Apply length limit if specified
      if (options?.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength) + '...';
      }

      return sanitized;
    } catch (error) {
      logger.error('Failed to sanitize HTML content', error);
      return '';
    }
  }

  /**
   * Sanitize plain text to prevent injection
   */
  sanitizeText(text: string, maxLength?: number): string {
    try {
      if (!text || typeof text !== 'string') return '';
      
      // Remove control characters and normalize whitespace
      let sanitized = text
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Apply length limit
      if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength).trim();
      }

      return sanitized;
    } catch (error) {
      logger.error('Failed to sanitize text content', error);
      return '';
    }
  }

  /**
   * Sanitize user profile data
   */
  sanitizeProfile(profile: {
    username?: string;
    full_name?: string;
    bio?: string;
  }) {
    return {
      username: this.sanitizeText(profile.username || '', 50),
      full_name: this.sanitizeText(profile.full_name || '', 100),
      bio: this.sanitizeText(profile.bio || '', 500)
    };
  }

  /**
   * Sanitize project data
   */
  sanitizeProject(project: {
    title?: string;
    description?: string;
    category?: string;
  }) {
    return {
      title: this.sanitizeText(project.title || '', 200),
      description: this.sanitizeText(project.description || '', 2000),
      category: this.sanitizeText(project.category || '', 50)
    };
  }

  /**
   * Sanitize comment content
   */
  sanitizeComment(content: string): string {
    return this.sanitizeText(content, 1000);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const sanitizer = ContentSanitizer.getInstance();