import * as Application from "expo-application";
import Constants from "expo-constants";

export default function currentAppVersion() {
  return (
    Constants.expoConfig?.extra?.appVersion ??
    Constants.expoConfig?.version ??
    Application.nativeApplicationVersion ??
    "unknown"
  );
}
