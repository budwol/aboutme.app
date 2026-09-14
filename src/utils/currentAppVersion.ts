import Constants from "expo-constants";

export default function currentAppVersion(): string {
  return Constants.expoConfig?.extra?.appVersion ?? "0.0.0";
}
