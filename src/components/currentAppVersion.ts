import * as Application from "expo-application";
import Constants from "expo-constants";

export default function currentAppVersion() {
  return (
    Constants.expoConfig?.extra?.appVersion ??
    process.env.EXPO_PUBLIC_APP_VERSION ??
    Constants.expoConfig?.version ??
    Application.nativeApplicationVersion ??
    "unknown"
  );
}
