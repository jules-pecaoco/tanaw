import "dotenv/config";
export default ({ config }) => ({
  ...config,
  name: "Tanaw",
  slug: "tanaw",
  version: "1.0.5",
  orientation: "portrait",
  icon: "./assets/images/tanaw_app_icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "dev.expo.tanaw",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/tanaw_app_icon.png",
      backgroundColor: "#ffffff",
    },
    package: "dev.expo.tanaw",
    googleServicesFile: "./google-services.json",
    notification: {
      icon: "./assets/images/tanaw_logo_notification.png",
      color: "#F47C25",
      androidCollapsedTitle: "Tanaw",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/tanaw_app_icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/tanaw_app_icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/tanaw_logo_notification.png",
        color: "#F47C25",
        defaultChannel: "default",
        sounds: ["./assets/sounds/notification_sound.wav"],
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken: process.env.MAPBOX_SECRET_KEY,
      },
    ],
    "expo-sqlite",
  ],
  experiments: {
    typedRoutes: true,
  },
  splash: {
    image: "./assets/images/tanaw_logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  extra: {
    eas: {
      projectId: "d9de4701-66fb-4402-88b5-18644a256c8e",
    },
    MAPBOX_PUBLIC_KEY: process.env.MAPBOX_PUBLIC_KEY,
    OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    GEMINI_URL: process.env.GEMINI_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  owner: "jules-pecaoco",
});
