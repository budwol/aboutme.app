import { LogBox } from "react-native";
import { logger, mapConsoleTransport } from "react-native-logs";

type LoggerMethod = (message: string) => void;

const ignoredLogs: RegExp[] = [
  /Support for defaultProps will be removed from function components/i,
  /"start" method does not exist in console/i,
  /"end" method does not exist in console/i,
  /React Native Firebase namespaced API/i,
  /Animated:.*useNativeDriver.*not supported/i,
  /Blocked aria-hidden on an element because its descendant retained focus/i,
];

LogBox.ignoreLogs(ignoredLogs.map((r) => r.source));

export const shouldIgnoreLogMessage = (message: string) =>
  ignoredLogs.some((regex) => regex.test(message));

const filterIgnoredMessages = <T extends LoggerMethod>(fn: T): T =>
  ((message: string) => {
    // defense-in-depth: LoggerBase.log() already filters before dispatching,
    // so this guard is unreachable through the public API today, but keeps
    // the transport itself safe if it's ever called directly.
    /* istanbul ignore if */
    if (shouldIgnoreLogMessage(message)) return;
    fn(message);
  }) as T;

// This app is web-only (platforms: ["web"] in app.config.ts), so only a
// console transport is needed. mapConsoleTransport (not consoleTransport)
// is used because consoleTransport always calls console.log wrapped in
// ANSI color codes — a browser console renders that as literal garbage and
// every level bypasses DevTools' error/warning filtering either way.
const reactLogger = logger.createLogger({
  levels: {
    debug: 0,
    log: 1,
    info: 4,
    warn: 5,
    error: 6,
  },
  transport: [mapConsoleTransport],
  transportOptions: {
    mapLevels: {
      debug: "log",
      log: "log",
      info: "info",
      warn: "warn",
      error: "error",
    },
  },
  dateFormat: "iso",
  printDate: false,
  printLevel: true,
  enabled: true,
});

reactLogger.log = filterIgnoredMessages(reactLogger.log);
reactLogger.info = filterIgnoredMessages(reactLogger.info);
reactLogger.warn = filterIgnoredMessages(reactLogger.warn);
reactLogger.error = filterIgnoredMessages(reactLogger.error);

export type LogLevel = "log" | "info" | "warn" | "error";

export function writeLog(level: LogLevel, msg: unknown, methodName?: string) {
  const line = `${methodName ?? "method"}: ${String(msg)}`;
  if (shouldIgnoreLogMessage(line)) return;

  switch (level) {
    case "error":
      reactLogger.error(line);
      break;
    case "warn":
      reactLogger.warn(line);
      break;
    case "info":
      reactLogger.info(line);
      break;
    default:
      reactLogger.log(line);
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
