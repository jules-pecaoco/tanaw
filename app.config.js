import "dotenv/config";
export default ({ config }) => ({
  ...config,
  name: "Tanaw",
  slug: "tanaw",
  version: "0.9.0",
  orientation: "portrait",
  icon: "./assets/images/tanaw-logo.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "dev.expo.tanaw",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/tanaw-logo.png",
      backgroundColor: "#ffffff",
    },
    package: "dev.expo.tanaw",
    googleServicesFile: "./google-services.json",
    notification: {
      icon: "./assets/images/tanaw-logo-circle.png",
      color: "#ffffff",
      androidCollapsedTitle: "Tanaw",
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/tanaw-logo.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/tanaw-logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
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
    image: "./assets/images/tanaw-logo.png",
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