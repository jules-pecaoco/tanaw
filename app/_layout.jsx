import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import storage from "@/storage/storage";
import { PROJECT_ID } from "@/tokens/tokens";
import { NotificationProvider } from "@/context/NotificationContext";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "RobotoCondensed-Black": require("../assets/fonts/RobotoCondensed-Black.ttf"),
    "RobotoCondensed-Bold": require("../assets/fonts/RobotoCondensed-Bold.ttf"),
    "RobotoCondensed-ExtraBold": require("../assets/fonts/RobotoCondensed-ExtraBold.ttf"),
    "RobotoCondensed-ExtraLight": require("../assets/fonts/RobotoCondensed-ExtraLight.ttf"),
    "RobotoCondensed-Light": require("../assets/fonts/RobotoCondensed-Light.ttf"),
    "RobotoCondensed-Medium": require("../assets/fonts/RobotoCondensed-Medium.ttf"),
    "RobotoCondensed-Regular": require("../assets/fonts/RobotoCondensed-Regular.ttf"),
    "RobotoCondensed-SemiBold": require("../assets/fonts/RobotoCondensed-SemiBold.ttf"),
    "RobotoCondensed-Thin": require("../assets/fonts/RobotoCondensed-Thin.ttf"),
    "RobotoCondensed-Italic": require("../assets/fonts/RobotoCondensed-Italic.ttf"),
    "RobotoCondensed-ExtraLightItalic": require("../assets/fonts/RobotoCondensed-ExtraLightItalic.ttf"),
    "RobotoCondensed-BoldItalic": require("../assets/fonts/RobotoCondensed-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 3,
        persist: true,
        networkMode: "online",
        refetchOnReconnect: true,
      },
    },
  });

  const userPersistStorage = createSyncStoragePersister({
    storage: storage,
    key: "react-query-full-cache",
    retry: 3,
  });

  return (
    <NotificationProvider projectId={PROJECT_ID}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: userPersistStorage }}>
        <SafeAreaProvider className="flex-1">
          <GestureHandlerRootView className="flex-1">
            <Stack>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(permissions)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </NotificationProvider>
  );
};

export default RootLayout;
