import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";

import { fetchWeatherData } from "@/services/openmeteo";

const cities = {
  "Bacolod City": { lat: 10.6765, lon: 122.9509 },
  "Bago City": { lat: 10.5333, lon: 122.8333 },
  "Cadiz City": { lat: 10.95, lon: 123.3 },
  "Escalante City": { lat: 10.8333, lon: 123.5 },
  "Himamaylan City": { lat: 10.1, lon: 122.8667 },
  "Kabankalan City": { lat: 9.9833, lon: 122.8167 },
  "La Carlota City": { lat: 10.4167, lon: 122.9167 },
  "Sagay City": { lat: 10.9, lon: 123.4167 },
  "San Carlos City": { lat: 10.4333, lon: 123.4167 },
  "Silay City": { lat: 10.8, lon: 122.9667 },
  "Sipalay City": { lat: 9.75, lon: 122.4 },
  "Talisay City": { lat: 10.7333, lon: 122.9667 },
  "Victorias City": { lat: 10.9, lon: 123.0833 },
};

const AnalyticsWidget = () => {
  const screenWidth = Dimensions.get("window").width - 40;
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("hourly");
  const [selectedCity, setSelectedCity] = useState("Bacolod City");

  // Date range picker state
  const [startDate, setStartDate] = useState(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)); // Default to 3 days ago
  const [endDate, setEndDate] = useState(new Date()); // Default to today
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  // Set filter range mode
  const [filterMode, setFilterMode] = useState("preset"); // "preset", "custom"
  const [presetRange, setPresetRange] = useState("3days"); // "today", "3days", "week", "all"

  // Custom date picker modal state
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState("start"); // "start" or "end"
  const [tempSelectedDate, setTempSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const weatherData = await fetchWeatherData(selectedCity);
        setData(weatherData);

        // Set available dates from the returned data
        if (weatherData?.daily?.time) {
          setAvailableDates(weatherData.daily.time);

          // Set default date range based on available data
          const firstAvailableDate = new Date(weatherData.daily.time[0]);
          const lastAvailableDate = new Date(weatherData.daily.time[weatherData.daily.time.length - 1]);

          // Default to last 3 days or what's available
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

          setStartDate(threeDaysAgo < firstAvailableDate ? firstAvailableDate : threeDaysAgo);
          setEndDate(lastAvailableDate);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  // Handle preset range selections
  useEffect(() => {
    if (!availableDates.length || filterMode !== "preset") return;

    const latest = new Date(availableDates[availableDates.length - 1]);
    const earliest = new Date(availableDates[0]);

    switch (presetRange) {
      case "today":
        setStartDate(latest);
        setEndDate(latest);
        break;
      case "3days":
        const threeDaysAgo = new Date(latest);
        threeDaysAgo.setDate(latest.getDate() - 2); // This gives 3 days total (today + 2 previous)
        setStartDate(threeDaysAgo < earliest ? earliest : threeDaysAgo);
        setEndDate(latest);
        break;
      case "week":
        const weekAgo = new Date(latest);
        weekAgo.setDate(latest.getDate() - 6); // This gives 7 days total
        setStartDate(weekAgo < earliest ? earliest : weekAgo);
        setEndDate(latest);
        break;
      case "all":
        setStartDate(earliest);
        setEndDate(latest);
        break;
    }
  }, [presetRange, availableDates, filterMode]);

  // Generate array of selectable dates based on available data
  const getSelectableDates = () => {
    if (!availableDates.length) return [];

    const firstDate = new Date(availableDates[0]);
    const lastDate = new Date(availableDates[availableDates.length - 1]);

    const dates = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Open date picker modal
  const openDatePicker = (type) => {
    setCurrentPickerType(type);
    setTempSelectedDate(type === "start" ? startDate : endDate);
    setShowDatePickerModal(true);
  };

  // Handle date selection in custom modal
  const handleDateSelection = (date) => {
    setTempSelectedDate(date);
  };

  // Confirm date selection
  const confirmDateSelection = () => {
    if (currentPickerType === "start") {
      // Make sure start date is not after end date
      if (tempSelectedDate > endDate) {
        setStartDate(endDate);
      } else {
        setStartDate(tempSelectedDate);
      }
    } else {
      // Make sure end date is not before start date
      if (tempSelectedDate < startDate) {
        setEndDate(startDate);
      } else {
        setEndDate(tempSelectedDate);
      }
    }
    setShowDatePickerModal(false);
  };

  // Cancel date selection
  const cancelDateSelection = () => {
    setShowDatePickerModal(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 font-bold">Error fetching weather data</Text>
      </View>
    );
  }

  const weatherData = data;
  const dataSource = selectedRange === "hourly" ? weatherData.hourly : weatherData.daily;

  // Format dates for filtering
  const startDateString = startDate.toISOString().split("T")[0];
  const endDateString = endDate.toISOString().split("T")[0];

  // Filter data based on selected date range
  const filterDataByDateRange = (data, timeArray) => {
    const filteredIndices = timeArray.reduce((indices, time, index) => {
      const dateString = time.split("T")[0];
      if (dateString >= startDateString && dateString <= endDateString) {
        indices.push(index);
      }
      return indices;
    }, []);

    // If no data matches our filter, return empty arrays
    if (filteredIndices.length === 0) {
      return {
        time: [],
        rain: [],
        precipitationProbability: [],
        temperature80m: [],
      };
    }

    // Extract data for the filtered date range
    const startIndex = filteredIndices[0];
    const endIndex = filteredIndices[filteredIndices.length - 1] + 1;

    return {
      time: timeArray.slice(startIndex, endIndex),
      rain: data.rain ? data.rain.slice(startIndex, endIndex) : [],
      precipitationProbability: data.precipitationProbability ? data.precipitationProbability.slice(startIndex, endIndex) : [],
      temperature80m: data.temperature80m ? data.temperature80m.slice(startIndex, endIndex) : [],
    };
  };

  const filteredData = filterDataByDateRange(dataSource, dataSource.time);

  // Convert data for Gifted Charts
  const formatDataForChart = (data, color) =>
    data.map((value, index) => ({
      value,
      label: filteredData.time[index]
        ? selectedRange === "hourly"
          ? filteredData.time[index].split("T")[1].slice(0, 5)
          : filteredData.time[index].split("T")[0].slice(5) // Show only MM-DD
        : "",
      labelTextStyle: { color: "gray", fontSize: 10 },
      dataPointColor: color,
    }));

  // Format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-100 px-4 pt-12">
      <Picker selectedValue={selectedCity} onValueChange={(itemValue) => setSelectedCity(itemValue)} className="font-fmedium text-lg">
        {Object.keys(cities).map((city) => (
          <Picker.Item key={city} label={city} value={city} />
        ))}
      </Picker>

      {/* Date Range Selector Section */}
      <View className="bg-white p-4 rounded-xl my-4">
        <Text className="text-center text-lg font-rmedium mb-4">Date Range Selector</Text>

        {/* Filter Mode Selector */}
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-lg ${filterMode === "preset" ? "bg-primary" : "bg-gray-300"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-rmedium ${filterMode === "preset" ? "text-white" : "text-gray-700"}`}>Preset Ranges</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-lg ${filterMode === "custom" ? "bg-primary" : "bg-gray-300"}`}
            onPress={() => setFilterMode("custom")}
          >
            <Text className={`font-rmedium ${filterMode === "custom" ? "text-white" : "text-gray-700"}`}>Custom Range</Text>
          </TouchableOpacity>
        </View>

        {/* Preset Range Selectors */}
        {filterMode === "preset" && (
          <View className="flex-row flex-wrap justify-center mb-2">
            {[
              { label: "Today", value: "today" },
              { label: "Last 3 Days", value: "3days" },
              { label: "Last Week", value: "week" },
              { label: "All Data", value: "all" },
            ].map((range) => (
              <TouchableOpacity
                key={range.value}
                className={`px-3 py-2 m-1 rounded-lg ${presetRange === range.value ? "bg-blue-500" : "bg-gray-200"}`}
                onPress={() => setPresetRange(range.value)}
              >
                <Text className={`font-rmedium ${presetRange === range.value ? "text-white" : "text-gray-700"}`}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Custom Date Range Selectors */}
        {filterMode === "custom" && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-rmedium">Start Date:</Text>
              <TouchableOpacity onPress={() => openDatePicker("start")} className="px-4 py-2 bg-gray-200 rounded-lg">
                <Text>{formatDateForDisplay(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="font-rmedium">End Date:</Text>
              <TouchableOpacity onPress={() => openDatePicker("end")} className="px-4 py-2 bg-gray-200 rounded-lg">
                <Text>{formatDateForDisplay(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Selected Date Range Display */}
        <View className="bg-gray-100 p-2 rounded-lg mt-2">
          <Text className="text-center text-gray-700">
            Showing data from {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-center mb-4">
        {["hourly", "daily"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 mx-2 rounded-lg ${selectedRange === type ? "bg-primary" : "bg-secondary"}`}
            onPress={() => setSelectedRange(type)}
          >
            <Text className={`font-rmedium text-lg ${selectedRange === type ? "text-white" : "text-white"}`}>
              {type === "hourly" ? "Hourly Data" : "Daily Data"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data summary */}
      <View className="bg-white p-3 rounded-xl my-4">
        <Text className="text-center text-lg font-rmedium mb-2">Data Summary</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="font-rmedium">Data Points</Text>
            <Text className="text-lg">{filteredData.time.length}</Text>
          </View>
          <View className="items-center">
            <Text className="font-rmedium">Date Range</Text>
            <Text className="text-lg">{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days</Text>
          </View>
        </View>
      </View>

      {/* Custom Date Picker Modal */}
      <Modal visible={showDatePickerModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-4 rounded-xl w-4/5 max-h-96">
            <Text className="text-center text-lg font-rmedium mb-4">Select {currentPickerType === "start" ? "Start" : "End"} Date</Text>

            <ScrollView className="max-h-64">
              {getSelectableDates().map((date, index) => {
                // Disable dates that are outside valid range
                const isDisabled = (currentPickerType === "start" && date > endDate) || (currentPickerType === "end" && date < startDate);

                const isSelected = tempSelectedDate && date.toDateString() === tempSelectedDate.toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !isDisabled && handleDateSelection(date)}
                    className={`py-3 px-4 mb-1 rounded-lg ${isSelected ? "bg-primary" : isDisabled ? "bg-gray-100" : "bg-gray-200"}`}
                    disabled={isDisabled}
                  >
                    <Text className={`text-center ${isSelected ? "text-white font-rmedium" : isDisabled ? "text-gray-400" : "text-gray-800"}`}>
                      {formatDateForDisplay(date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="flex-row justify-around mt-4">
              <TouchableOpacity onPress={cancelDateSelection} className="px-4 py-2 bg-gray-300 rounded-lg">
                <Text className="font-rmedium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmDateSelection} className="px-4 py-2 bg-primary rounded-lg" disabled={!tempSelectedDate}>
                <Text className="font-rmedium text-white">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {filteredData.time.length === 0 ? (
        <View className="bg-white p-4 rounded-xl my-4 items-center">
          <Text className="text-lg font-rmedium text-red-500">No data available for selected date range</Text>
        </View>
      ) : (
        <View>
          {/* Temperature Chart */}
          <View className="bg-white p-3 rounded-xl my-4">
            <Text className="text-center text-lg font-rmedium mb-2">Temperature (°C) Trends</Text>
            <ScrollView horizontal>
              <LineChart
                data={formatDataForChart(filteredData.temperature80m || [], "#FF8C00")}
                width={screenWidth * 1.5}
                height={250}
                yAxisSuffix="°C"
                xAxisLabelRotation={45}
                curved
                areaChart
                hideRules
                startFillColor={"rgba(255, 140, 0, 0.3)"}
                endFillColor={"rgba(255, 140, 0, 0.05)"}
                startOpacity={0.9}
                endOpacity={0.2}
              />
            </ScrollView>
          </View>

          {/* Rainfall Chart */}
          <View className="bg-white p-3 rounded-xl my-4">
            <Text className="text-center text-lg font-rmedium mb-2">Rain Water Height</Text>
            <ScrollView horizontal>
              <LineChart
                data={formatDataForChart(filteredData.rain || [], "#0096FF")}
                width={screenWidth * 1.5}
                height={250}
                yAxisSuffix="mm"
                xAxisLabelRotation={45}
                areaChart
                hideRules
                startFillColor={"rgba(0, 150, 255, 0.3)"}
                endFillColor={"rgba(0, 150, 255, 0.05)"}
                startOpacity={0.9}
                endOpacity={0.2}
              />
            </ScrollView>
          </View>

          {/* Precipitation Chart */}
          <View className="bg-white p-3 rounded-xl mb-16">
            <Text className="text-center text-lg font-rmedium mb-2">Chance of Rain</Text>
            <ScrollView horizontal>
              <LineChart
                data={formatDataForChart(filteredData.precipitationProbability || [], "#0096FF")}
                width={screenWidth * 1.5}
                height={250}
                yAxisSuffix="%"
                xAxisLabelRotation={45}
                areaChart
                hideRules
                startFillColor={"rgba(0, 150, 255, 0.3)"}
                endFillColor={"rgba(0, 150, 255, 0.05)"}
                startOpacity={0.9}
                endOpacity={0.2}
              />
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AnalyticsWidget;
