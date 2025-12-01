/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Professional logging utility for the application
 * Provides structured logging with different levels
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage({ level: 'info', message, timestamp: new Date(), data }));
    }
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage({ level: 'warn', message, timestamp: new Date(), data }));
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    
    console.error(this.formatMessage({ level: 'error', message, timestamp: new Date(), data: errorData }));
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage({ level: 'debug', message, timestamp: new Date(), data }));
    }
  }
}

export const logger = new Logger();
