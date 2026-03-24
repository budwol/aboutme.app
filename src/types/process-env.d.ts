declare namespace NodeJS {
  interface ProcessEnv {
    APP_DESCRIPTION: string;
    APP_NAME: string;
    BASE_URL: string;
    CI: string;
    DEPLOY_TARGET_DIR: string;
    DOCKER_PASSWORD: string;
    DOCKER_USERNAME: string;
    EXPO_OWNER: string;
    EXPO_PUBLIC_ENABLE_SOURCE_MAPS: string;
    EXPO_PUBLIC_GOOGLE_SITE_VERIFICATION: string;
    EXPO_PUBLIC_SITE_URL: string;
    EXPO_SLUG: string;
    NODE_ENV: string;
    PACKAGE: string;
    SCHEME: string;
    SKIP_AUTH: string;
  }
}
