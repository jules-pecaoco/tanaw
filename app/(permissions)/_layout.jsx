import { Stack } from "expo-router/stack";

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
