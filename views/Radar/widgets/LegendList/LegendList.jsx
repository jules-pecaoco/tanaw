import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LEGEND_ITEMS } from "./legendconfig";

const ICON_SIZE = 18;
const INTERACTIVE_ICON_SIZE = 14;

const LegendItem = ({ item }) => {
  const interactiveIcon = item.type === "symbol" && item.icon && (
    <MaterialIcons name={item.icon.name} size={ICON_SIZE} color={item.icon.color || "#000"} />
  );

  return (
    <View className="flex-col items-start gap-2">
      <View className="flex-1 justify-center">
        <Text className="text-sm text-gray-800 font-rmedium">{item.label}</Text>
        {item.interactive && (
          <View className="flex-row items-center mt-0.5 gap-3">
            {interactiveIcon}
            <View className="flex-row items-center">
              <MaterialIcons name="ads-click" size={INTERACTIVE_ICON_SIZE} color="#007AFF" />
              <Text className="text-xs text-blue-500 ml-1 italic">Interactive</Text>
            </View>
          </View>
        )}
      </View>
      <View className="items-start mb-3">
        {item.type === "color" && item.colors && item.colors.length > 0 && (
          <View className="flex-col">
            {item.colors.map((colorItem, index) => (
              <View key={index} className="flex-row items-center">
                {interactiveIcon}
                <View className="w-[18px] h-[18px] rounded-full mr-1.5 border border-black/20" style={{ backgroundColor: colorItem.color }} />
                <Text className="text-xs text-gray-600 flex-shrink-1">{colorItem.description}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const LegendList = ({ appState }) => {
  const [isVisible, setIsVisible] = useState(false); // Default to hidden

  const activeLegends = useMemo(() => {
    const filtered = Object.values(LEGEND_ITEMS).filter((item) => item.isActive(appState));

    // Group by category
    return filtered.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [appState]);

  if (Object.keys(activeLegends).length === 0 && !isVisible) {
    return null;
  }

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <TouchableOpacity onPress={toggleVisibility} className="flex-row items-center bg-black/70 py-2 px-3 rounded-xl self-start mb-1">
        <MaterialIcons name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#FFFFFF" />
        <Text className="text-white font-rbold ml-1">Map Legend ({Object.values(activeLegends).flat().length})</Text>
      </TouchableOpacity>

      {isVisible && Object.keys(activeLegends).length > 0 && (
        <ScrollView
          className="bg-white/90 rounded-xl p-2.5 border border-gray-300"
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(activeLegends).map(([category, items]) => (
            <View key={category}>
              <Text className="text-base font-rbold mb-2 text-gray-800 border-b border-gray-200 pb-1">{category}</Text>
              {items.map((item) => {
                return <LegendItem key={item.id} item={item} />;
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {isVisible && Object.keys(activeLegends).length === 0 && (
        <View className="bg-white/90 rounded-xl p-2.5 border border-gray-300">
          <Text className="text-center p-2.5 text-gray-500 italic">No active layers with legends.</Text>
        </View>
      )}
    </>
  );
};

export default LegendList;
