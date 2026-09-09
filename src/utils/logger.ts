type LoggerBaseType = {
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
