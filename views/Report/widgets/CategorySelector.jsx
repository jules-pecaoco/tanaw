import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

const CategoryDropdown = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View className="my-2">
      <Text className="text-base font-medium mb-2">Select Hazard Type:</Text>
      <View className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
        <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => onSelectCategory(itemValue)} className="h-12 w-full text-gray-800">
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.label} value={category.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default CategoryDropdown;
