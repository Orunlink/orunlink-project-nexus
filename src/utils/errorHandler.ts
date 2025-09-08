import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  originalError?: Error;
}

export class ErrorHandler {
  static handle(error: Error | any, context?: string): AppError {
    const appError: AppError = {
      message: 'An unexpected error occurred',
      originalError: error instanceof Error ? error : new Error(String(error))
    };

    // Handle different types of errors
    if (error?.code === 'auth/user-not-found') {
      appError.message = 'User not found. Please check your email address.';
      appError.code = 'USER_NOT_FOUND';
    } else if (error?.code === 'auth/wrong-password') {
      appError.message = 'Incorrect password. Please try again.';
      appError.code = 'WRONG_PASSWORD';
    } else if (error?.code === 'auth/email-already-in-use') {
      appError.message = 'An account with this email already exists.';
      appError.code = 'EMAIL_IN_USE';
    } else if (error?.message) {
      appError.message = error.message;
    }

    // Log the error
    logger.error(`Error in ${context || 'Unknown context'}`, error, {
      code: appError.code,
      status: appError.status
    });

    return appError;
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const appError = ErrorHandler.handle(error, context);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw appError;
    }
  }
}