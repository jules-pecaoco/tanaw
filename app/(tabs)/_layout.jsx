import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image } from "react-native";
import { icons } from "@/constants/index";

const TabIcon = (props) => {
  const { icon, color, focused, name } = props;
  return (
    <View className="items-center justify-center w-16 mt-6">
      <Image source={icon} resizeMode="contain" tintColor={color}></Image>
      <Text className={`${focused ? "font-rsemibold" : "font-rregular"} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
};

export default function Layout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0.5,
            borderTopColor: "#232533",
            height: 65,
          },
        }}
      >
        <Tabs.Screen
          name="radar"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.radar} color={color} name="Home" focused={focused}></TabIcon>,
          }}
        />
        <Tabs.Screen
          name="forecast"
          options={{
            title: "Forecast",
            tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.forecast} color={color} name="Forecast" focused={focused}></TabIcon>,
          }}
        />
        <Tabs.Screen
          name="alert"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, focused }) => <TabIcon icon={icons.bell} color={color} name="Notifications" focused={focused}></TabIcon>,
          }}
        />
      </Tabs>
      <StatusBar backgroundColor="#ffffff" style="light"></StatusBar>
    </>
  );
}
