type LoggerBaseType = {
  shareLogfileAsync: () => Promise<void>;
  deleteLogFileAsync: () => Promise<void>;
  readLogFileAsync: () => Promise<string>;
  info: (msg: unknown) => void;
  warn: (methodName: string, msg: unknown) => void;
  error: (methodName: string, msg: unknown) => void;
};

let LoggerBase: LoggerBaseType | null = null;

function ensureLogger() {
  if (!__DEV__ || LoggerBase) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LoggerBase = require("@utils/logger.base").default as LoggerBaseType;
}

export default class Logger {
  public static async shareLogfileAsync() {
    ensureLogger();
    await LoggerBase?.shareLogfileAsync();
  }

  public static async deleteLogFileAsync() {
    ensureLogger();
    await LoggerBase?.deleteLogFileAsync();
  }

  public static async readLogFileAsync(): Promise<string> {
    ensureLogger();
    return LoggerBase?.readLogFileAsync() ?? "";
  }

  public static info(msg: unknown) {
    ensureLogger();
    LoggerBase?.info(msg);
  }

  public static warn(methodName: string, msg: unknown) {
    ensureLogger();
    LoggerBase?.warn(methodName, msg);
  }

  public static error(methodName: string, msg: unknown) {
    ensureLogger();
    LoggerBase?.error(methodName, msg);
  }
}
