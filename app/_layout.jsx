import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default RootLayout;
