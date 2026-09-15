type LoggerMethod = (message: string) => void;

const ignoredLogs: RegExp[] = [
  /Support for defaultProps will be removed from function components/i,
  /"start" method does not exist in console/i,
  /"end" method does not exist in console/i,
  /React Native Firebase namespaced API/i,
  /Animated:.*useNativeDriver.*not supported/i,
  /Blocked aria-hidden on an element because its descendant retained focus/i,
];

export const shouldIgnoreLogMessage = (message: string) =>
  ignoredLogs.some((regex) => regex.test(message));

const filterIgnoredMessages = <T extends LoggerMethod>(fn: T): T =>
  ((message: string) => {
    // defense-in-depth: writeLog() already filters before dispatching, so
    // this guard is unreachable through the public API today, but keeps
    // the transport itself safe if it's ever called directly.
    /* istanbul ignore if */
    if (shouldIgnoreLogMessage(message)) return;
    fn(message);
  }) as T;

// This is the one designated console transport for the app's logger — the
// no-console lint rule (allow: ["warn", "error"]) is deliberately narrowed
// here, mirroring how scripts/**/*.{cjs,mjs,js} is exempted wholesale.
const consoleLog = filterIgnoredMessages((message: string) =>
  // eslint-disable-next-line no-console
  console.log(`LOG : ${message}`),
);
const consoleInfo = filterIgnoredMessages((message: string) =>
  // eslint-disable-next-line no-console
  console.info(`INFO: ${message}`),
);
const consoleWarn = filterIgnoredMessages((message: string) =>
  console.warn(`WARN: ${message}`),
);
const consoleError = filterIgnoredMessages((message: string) =>
  console.error(`ERROR: ${message}`),
);

export type LogLevel = "log" | "info" | "warn" | "error";

export function writeLog(level: LogLevel, msg: unknown, methodName?: string) {
  const line = `${methodName ?? "method"}: ${String(msg)}`;
  if (shouldIgnoreLogMessage(line)) return;

  switch (level) {
    case "error":
      consoleError(line);
      break;
    case "warn":
      consoleWarn(line);
      break;
    case "info":
      consoleInfo(line);
      break;
    default:
      consoleLog(line);
  }
}

const LoggerBase = {
  info(msg: unknown): void {
    writeLog("info", msg);
  },

  warn(methodName: string, msg: unknown) {
    writeLog("warn", msg, methodName);
  },

  error(methodName: string, msg: unknown) {
    writeLog("error", msg, methodName);
  },
};

export default LoggerBase;
