import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const TabIcon = ({ iconName, iconFilled, color, focused, name, customeStyle }) => {
  return (
    <View className={`items-center w-16 mt-4 ${customeStyle}`}>
      <MaterialCommunityIcons name={focused ? iconFilled : iconName} size={24} color={color} />
      {name && (
        <Text className={`${focused ? "font-rsemibold" : "font-rregular"} text-xs`} style={{ color: color }}>
          {name}
        </Text>
      )}
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
          name="news"
          options={{
            title: "News",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="newspaper-variant-multiple-outline"
                iconFilled="newspaper-variant-multiple"
                color={color}
                name="News"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: "Report",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="camera"
                iconFilled="camera-iris"
                name="Report"
                color={color}
                focused={focused}
                customeStyle={`absolute bg-white border-[3px] border-primary  w-[5rem] h-[5rem] rounded-full flex justify-center align-center`}
              />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                activeOpacity={1} // This prevents the opacity change when pressed
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="chart-bar" iconFilled="chart-bar-stacked" color={color} name="Analytics" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: "Notification",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon iconName="bell-outline" iconFilled="bell" color={color} name="Notification" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
