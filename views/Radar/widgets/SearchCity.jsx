import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import uuid from "react-native-uuid";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { searchCity, searchCityDetails } from "@/services/mapbox";

const SearchCity = ({ currentLocation, setSearchCityDetails, handleSearchZoom }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sessionToken, setSessionToken] = useState(uuid.v4());

  const handleSearch = async (text) => {
    setQuery(text);

    if (text.length > 2) {
      const cityResults = await searchCity(text, currentLocation, sessionToken);
      setResults(cityResults || []);
    } else {
      setResults([]);
    }
  };

  const handleNewSession = () => {
    setSessionToken(uuid.v4());
    setResults([]);
    setQuery("");
  };

  const handleSearchCityDetail = async (id, city) => {
    setQuery(city);
    setResults(0);
    try {
      const cityDetailsResults = await searchCityDetails(id, sessionToken);
      setSearchCityDetails({
        longitude: cityDetailsResults.geometry.coordinates[0],
        latitude: cityDetailsResults.geometry.coordinates[1],
      });
      handleSearchZoom(cityDetailsResults.geometry.coordinates[0], cityDetailsResults.geometry.coordinates[1]);
    } catch (error) {
      console.error("Error fetching city details search:", error);
    }
  };

  return (
    <>
      <View className="w-full bg-white rounded-full  flex flex-row items-center px-5 mb-2">
        <MaterialCommunityIcons name="magnify" size={24} color="black" />
        <TextInput placeholder="Search for a city..." value={query} onChangeText={handleSearch} className="text-lg rounded-t-lg h-14 px-5 w-[90%]" />
      </View>
      <View>
        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.mapbox_id}
            className="max-h-60 w-full bg-white"
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() => handleSearchCityDetail(item.mapbox_id, item.name)} className="p-3 border-b border-gray-200">
                  <Text className="text-base font-medium">{item.name}</Text>
                  <Text className="text-sm text-gray-600">{item.context?.region?.name || ""}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </>
  );
};

export default SearchCity;
