type LoggerBaseType = {
  info: (msg: unknown) => void;
  warn: (methodName: string, msg: unknown) => void;
  error: (methodName: string, msg: unknown) => void;
};

let LoggerBase: LoggerBaseType | null = null;

function ensureLogger() {
  if (!__DEV__ || LoggerBase) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LoggerBase = require("@utils/loggerBase").default as LoggerBaseType;
}

const Logger = {
  info(msg: unknown) {
    ensureLogger();
    LoggerBase?.info(msg);
  },

  warn(methodName: string, msg: unknown) {
    ensureLogger();
    LoggerBase?.warn(methodName, msg);
  },

  error(methodName: string, msg: unknown) {
    ensureLogger();
    LoggerBase?.error(methodName, msg);
  },
};

export default Logger;
