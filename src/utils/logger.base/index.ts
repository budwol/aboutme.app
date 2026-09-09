import { LogBox } from "react-native";
import { logger, mapConsoleTransport } from "react-native-logs";

type LoggerMethod = (message: string) => void;

// keep muted warnings in one place
const ignoredLogs: RegExp[] = [
  /Support for defaultProps will be removed from function components/i,
  /"start" method does not exist in console/i,
  /"end" method does not exist in console/i,
  /React Native Firebase namespaced API/i,
  /Animated:.*useNativeDriver.*not supported/i,
  /Blocked aria-hidden on an element because its descendant retained focus/i,
];

// mute repeated dev overlay warnings
LogBox.ignoreLogs(ignoredLogs.map((r) => r.source));

export const shouldIgnoreLogMessage = (message: string) =>
  ignoredLogs.some((regex) => regex.test(message));

const filterIgnoredMessages = <T extends LoggerMethod>(fn: T): T =>
  ((message: string) => {
    if (shouldIgnoreLogMessage(message)) return;
    fn(message);
  }) as T;

// app.config.ts pins `platforms: ["web"]` — this app never ships to native,
// so logging only ever needs a console transport. No on-device log file, no
// expo-file-system/expo-sharing dependency, no native-only branch.
//
// mapConsoleTransport (not consoleTransport): consoleTransport always calls
// console.log and wraps the message in ANSI color codes, which is meant for
// a terminal — a browser console renders those codes as literal garbage
// text instead of color, and every log call bypasses DevTools' per-level
// filtering (Errors/Warnings) since nothing ever reaches console.error or
// console.warn. mapConsoleTransport routes each level to the matching
// console method via `mapLevels` instead.
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

// filter ignored messages before they reach the transports
reactLogger.log = filterIgnoredMessages(reactLogger.log);
reactLogger.info = filterIgnoredMessages(reactLogger.info);
reactLogger.warn = filterIgnoredMessages(reactLogger.warn);
reactLogger.error = filterIgnoredMessages(reactLogger.error);

export enum LogPrefix {
  log,
  info,
  warn,
  error,
}

export default class LoggerBase {
  public static info(msg: unknown): void {
    this.log(LogPrefix.info, msg);
  }

  public static warn(methodName: string, msg: unknown) {
    this.log(LogPrefix.warn, msg, methodName);
  }

  public static error(methodName: string, msg: unknown) {
    this.log(LogPrefix.error, msg, methodName);
  }

  private static log(prefix: LogPrefix, msg: unknown, methodName?: string) {
    const line = `${methodName ?? "method"}: ${String(msg)}`;
    if (shouldIgnoreLogMessage(line)) return;

    switch (prefix) {
      case LogPrefix.error:
        reactLogger.error(line);
        break;
      case LogPrefix.warn:
        reactLogger.warn(line);
        break;
      case LogPrefix.info:
        reactLogger.info(line);
        break;
      default:
        reactLogger.log(line);
    }
  }
}
