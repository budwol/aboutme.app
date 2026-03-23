import * as FileSystem from "expo-file-system/legacy";
import { shareAsync } from "expo-sharing";
import { LogBox, Platform } from "react-native";
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from "react-native-logs";

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

const config = {
  levels: {
    debug: 0,
    log: 1,
    info: 4,
    warn: 5,
    error: 6,
  },
  transport: [consoleTransport],
  transportOptions: {
    mapLevels: {
      debug: "log",
      log: "log",
      info: "info",
      warn: "warn",
      err: "error",
    },
    colors: {
      debug: "white",
      log: "white",
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
    FS: FileSystem,
    fileName: "app.log",
  },
  dateFormat: "iso",
  printDate: Platform.OS !== "web",
  printLevel: true,
  enabled: true,
} as const;

if (Platform.OS !== "web") {
  // @ts-expect-error react-native-logs supports mixed transports, but its generics are narrower than runtime behavior.
  config.transport.push(fileAsyncTransport);
}

// @ts-expect-error createLogger transport generics do not model the mixed transport setup used here.
const reactLogger = logger.createLogger(config);

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

const logFilePath = FileSystem.documentDirectory + "app.log";

export default class LoggerBase {
  public static isEnabled = Platform.OS === "web";

  public static async shareLogfileAsync() {
    await shareAsync(logFilePath, {
      dialogTitle: "logfile",
      mimeType: "text/plain",
    });
  }

  public static async deleteLogFileAsync() {
    const info = await FileSystem.getInfoAsync(logFilePath);
    if (info.exists) await FileSystem.deleteAsync(logFilePath);
  }

  public static async readLogFileAsync(): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(logFilePath, {
        encoding: "utf8",
      });
    } catch {
      return "";
    }
  }

  public static info(msg: unknown): void {
    if (!this.isEnabled) return;
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
