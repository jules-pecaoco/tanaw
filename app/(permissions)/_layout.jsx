import React from "react";
import { Stack } from "expo-router";

const PermissionLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="geolocation"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="notification"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
      </Stack>
    </>
  );
};

export default PermissionLayout;
