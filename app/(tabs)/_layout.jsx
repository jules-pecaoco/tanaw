import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const TabIcon = ({ iconName, iconFilled, color, focused, name }) => {
  return (
    <View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }} className="items-center w-16 mt-4">
      <MaterialCommunityIcons name={focused ? iconFilled : iconName} size={24} color={color} />
      <Text className={`${focused ? "font-rsemibold" : "font-rregular"} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
};

export default function Layout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#fff" hidden />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: "#F47C25",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0.5,
            borderTopColor: "#232533",
            height: 70,
          },
        }}
      >
        <Tabs.Screen
          name="radar"
          options={{
            title: "Radar",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="compass-outline" iconFilled="compass" color={color} name="Radar" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="forecast"
          options={{
            title: "Forecast",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="chart-bar" iconFilled="chart-bar-stacked" color={color} name="Forecast" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="bell-outline" iconFilled="bell" color={color} name="Notifications" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
