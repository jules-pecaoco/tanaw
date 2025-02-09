import "dotenv/config";

export default ({ config }) => ({
  ...config,
  name: "Tanaw",
  slug: "tanaw",
  version: "0.1.6",
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
  },
  owner: "jules-pecaoco",
});
