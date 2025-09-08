// Centralized logging utility for the application
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };

    if (this.isDevelopment) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       level === 'debug' ? console.debug : console.log;
      
      logMethod(`[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`, context || '');
    }

    // In production, you could send logs to a service like LogRocket, Sentry, etc.
    if (!this.isDevelopment && level === 'error') {
      // TODO: Send to error tracking service
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.formatLog('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.formatLog('warn', message, context);
  }

  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    };
    this.formatLog('error', message, errorContext);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.formatLog('debug', message, context);
  }
}

export const logger = Logger.getInstance();