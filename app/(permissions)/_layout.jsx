import React from "react";
import { Stack } from "expo-router";

const PermissionLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="locationAccess"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="notificationAccess"
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
      </Stack>
    </>
  );
};

export default PermissionLayout;
