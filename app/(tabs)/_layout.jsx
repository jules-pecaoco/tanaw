import { Stack } from "expo-router/stack";
import { Text } from "react-native";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Stack.Screen>
        <Text className="bg-primary">Tanaw</Text>
      </Stack.Screen>
    </Stack>
  );
}
