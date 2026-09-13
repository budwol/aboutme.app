import packageJson from "../../package.json";

export default function currentAppVersion() {
  return packageJson.version;
}
