export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private format(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      const entry = this.format(LogLevel.DEBUG, message, data);
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, data?: any): void {
    const entry = this.format(LogLevel.INFO, message, data);
    console.log(JSON.stringify(entry));
  }

  warn(message: string, data?: any): void {
    const entry = this.format(LogLevel.WARN, message, data);
    console.warn(JSON.stringify(entry));
  }

  error(message: string, error?: Error | any, data?: any): void {
    const entry = this.format(LogLevel.ERROR, message, {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    });
    console.error(JSON.stringify(entry));
  }
}

export const logger = new Logger();
