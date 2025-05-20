import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { fetchWeatherData } from "@/services/openmeteo"; // Assuming this service exists and works

// Hardcoded cities, as per original Code 1
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

  const [rawData, setRawData] = useState(null); // Stores the full fetched data
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState("Bacolod City");
  const [selectedRangeType, setSelectedRangeType] = useState("hourly");

  // Date range and picker state
  const [minDataDate, setMinDataDate] = useState(null);
  const [maxDataDate, setMaxDataDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Filter mode and preset range
  const [filterMode, setFilterMode] = useState("preset"); // 'preset' or 'custom'
  const [presetRange, setPresetRange] = useState("3days"); // 'today', '3days', 'week', 'all'

  // Effect for fetching data when city changes
  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the actual coordinates if your fetchWeatherData needs them,
        // otherwise, just pass the city name if that's what it expects.
        // For this example, I'm assuming fetchWeatherData takes the city name.
        const weatherData = await fetchWeatherData(selectedCity, cities[selectedCity].lat, cities[selectedCity].lon);
        setRawData(weatherData);

        if (weatherData?.daily?.time && weatherData.daily.time.length > 0) {
          const firstDate = new Date(weatherData.daily.time[0]);
          const lastDate = new Date(weatherData.daily.time[weatherData.daily.time.length - 1]);
          setMinDataDate(firstDate);
          setMaxDataDate(lastDate);

          // Initialize date range based on '3days' preset and available data
          const threeDaysAgo = new Date(lastDate);
          threeDaysAgo.setDate(lastDate.getDate() - 2);
          setStartDate(threeDaysAgo < firstDate ? new Date(firstDate) : threeDaysAgo);
          setEndDate(new Date(lastDate));
        } else if (weatherData?.hourly?.time && weatherData.hourly.time.length > 0) {
          // Fallback to hourly if daily is not comprehensive
          const firstHourlyDateStr = weatherData.hourly.time[0].split("T")[0];
          const lastHourlyDateStr = weatherData.hourly.time[weatherData.hourly.time.length - 1].split("T")[0];

          const firstDate = new Date(firstHourlyDateStr);
          const lastDate = new Date(lastHourlyDateStr);
          setMinDataDate(firstDate);
          setMaxDataDate(lastDate);

          const threeDaysAgo = new Date(lastDate);
          threeDaysAgo.setDate(lastDate.getDate() - 2);
          setStartDate(threeDaysAgo < firstDate ? new Date(firstDate) : threeDaysAgo);
          setEndDate(new Date(lastDate));
        } else {
          // Handle case with no time data
          const today = new Date();
          setMinDataDate(today);
          setMaxDataDate(today);
          setStartDate(today);
          setEndDate(today);
        }
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(err.message || "Failed to fetch weather data");
        setRawData(null); // Clear previous data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadWeatherData();
  }, [selectedCity]);

  // Effect for handling preset range changes
  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset") return;

    let newStart = new Date(minDataDate);
    let newEnd = new Date(maxDataDate);
    const dataContextEndDate = new Date(maxDataDate); // Use maxDataDate as 'today' in dataset context

    switch (presetRange) {
      case "today":
        newStart = new Date(dataContextEndDate);
        newEnd = new Date(dataContextEndDate);
        break;
      case "3days":
        newStart = new Date(dataContextEndDate);
        newStart.setDate(dataContextEndDate.getDate() - 2);
        newEnd = new Date(dataContextEndDate);
        break;
      case "week":
        newStart = new Date(dataContextEndDate);
        newStart.setDate(dataContextEndDate.getDate() - 6);
        newEnd = new Date(dataContextEndDate);
        break;
      case "all":
        // newStart and newEnd are already minDataDate and maxDataDate
        break;
    }
    setStartDate(newStart < minDataDate ? new Date(minDataDate) : newStart);
    setEndDate(newEnd > maxDataDate ? new Date(maxDataDate) : newEnd);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  // Memoized processing of data for charts
  const processedChartData = useMemo(() => {
    if (!rawData || (!rawData.hourly?.time && !rawData.daily?.time)) {
      return { tempPoints: [], rainPoints: [], precipPoints: [], totalPoints: 0, filteredTimeLabels: [] };
    }

    const source = selectedRangeType === "hourly" ? rawData.hourly : rawData.daily;
    if (!source || !source.time || source.time.length === 0) {
      return { tempPoints: [], rainPoints: [], precipPoints: [], totalPoints: 0, filteredTimeLabels: [] };
    }

    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

    const filteredIndices = [];
    source.time.forEach((timeStr, index) => {
      const itemDate = new Date(timeStr);
      if (itemDate >= startDay && itemDate <= endDay) {
        filteredIndices.push(index);
      }
    });

    if (filteredIndices.length === 0) {
      return { tempPoints: [], rainPoints: [], precipPoints: [], totalPoints: 0, filteredTimeLabels: [] };
    }

    const tempValues = [];
    const rainValues = [];
    const precipValues = [];
    const timeLabels = [];

    filteredIndices.forEach((index) => {
      tempValues.push(source.temperature_2m?.[index] ?? source.temperature80m?.[index] ?? 0); // Use temperature_2m if available
      rainValues.push(source.rain?.[index] ?? 0);
      precipValues.push(source.precipitation_probability?.[index] ?? source.precipitationProbability?.[index] ?? 0); // Use precipitation_probability

      const timeStr = source.time[index];
      timeLabels.push(
        selectedRangeType === "hourly"
          ? timeStr.split("T")[1].slice(0, 5) // HH:MM
          : timeStr.split("T")[0].slice(5) // MM-DD
      );
    });

    const commonProps = {
      labelTextStyle: { color: "gray", fontSize: 10 },
    };

    return {
      tempPoints: tempValues.map((value, i) => ({ value, label: timeLabels[i], ...commonProps, dataPointColor: "#FF8C00" })),
      rainPoints: rainValues.map((value, i) => ({ value, label: timeLabels[i], ...commonProps, dataPointColor: "#0096FF" })),
      precipPoints: precipValues.map((value, i) => ({ value, label: timeLabels[i], ...commonProps, dataPointColor: "#4CAF50" })),
      totalPoints: filteredIndices.length,
      filteredTimeLabels: timeLabels, // For potential debugging or direct use
    };
  }, [rawData, selectedRangeType, startDate, endDate]);

  // Date picker change handlers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newStartDate = selectedDate < minDataDate ? new Date(minDataDate) : selectedDate;
      setStartDate(newStartDate > endDate ? new Date(endDate) : newStartDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newEndDate = selectedDate > maxDataDate ? new Date(maxDataDate) : selectedDate;
      setEndDate(newEndDate < startDate ? new Date(startDate) : newEndDate);
    }
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getRangeDurationDisplay = () => {
    if (!startDate || !endDate || !minDataDate || !maxDataDate) return "0 days";
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#FF8C00" />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-100">
        <Text className="text-red-500 font-bold text-center">Error: {error}</Text>
        <Text className="text-gray-600 text-center mt-2">
          Could not load weather data for {selectedCity}. Please try again or select a different city.
        </Text>
      </View>
    );
  }

  const noDataForCriteria = processedChartData.totalPoints === 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-200 px-4 pt-12">
      <View className="bg-white rounded-lg mb-4 shadow-md">
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
          style={{ height: 50, width: "100%" }}
          itemStyle={{ fontFamily: "System" }} // Example for font, adjust as needed
        >
          {Object.keys(cities).map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
      {/* Date Range Selector Section */}
      <View className="bg-white p-4 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-bold mb-4 text-gray-700">Date Range Selector</Text>

        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-lg ${filterMode === "preset" ? "bg-orange-500" : "bg-gray-300"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-semibold ${filterMode === "preset" ? "text-white" : "text-gray-700"}`}>Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-lg ${filterMode === "custom" ? "bg-orange-500" : "bg-gray-300"}`}
            onPress={() => setFilterMode("custom")}
          >
            <Text className={`font-semibold ${filterMode === "custom" ? "text-white" : "text-gray-700"}`}>Custom</Text>
          </TouchableOpacity>
        </View>

        {filterMode === "preset" && (
          <View className="flex-row flex-wrap justify-center mb-2">
            {[
              { label: "Today", value: "today" },
              { label: "3 Days", value: "3days" },
              { label: "1 Week", value: "week" },
              { label: "All Data", value: "all" },
            ].map((range) => (
              <TouchableOpacity
                key={range.value}
                className={`px-3 py-2 m-1 rounded-lg ${presetRange === range.value ? "bg-blue-500" : "bg-gray-200"}`}
                onPress={() => setPresetRange(range.value)}
                disabled={!minDataDate || !maxDataDate} // Disable if no data loaded
              >
                <Text className={`font-semibold ${presetRange === range.value ? "text-white" : "text-gray-700"}`}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filterMode === "custom" && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-semibold text-gray-700">Start Date:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-lg">
                <Text className="text-gray-800">{formatDateForDisplay(startDate)}</Text>
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={minDataDate}
                maximumDate={endDate}
              />
            )}
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold text-gray-700">End Date:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-lg">
                <Text className="text-gray-800">{formatDateForDisplay(endDate)}</Text>
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
                maximumDate={maxDataDate}
              />
            )}
          </View>
        )}

        <View className="bg-gray-100 p-2 rounded-lg mt-3">
          <Text className="text-center text-sm text-gray-600">
            Showing data: {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-center mb-4">
        {["hourly", "daily"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 mx-2 rounded-lg ${selectedRangeType === type ? "bg-orange-500" : "bg-orange-300"}`}
            onPress={() => setSelectedRangeType(type)}
          >
            <Text className="font-semibold text-lg text-white">{type.charAt(0).toUpperCase() + type.slice(1)} Data</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="bg-white p-3 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-bold mb-2 text-gray-700">Data Summary</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="font-semibold text-gray-600">Data Points</Text>
            <Text className="text-lg font-bold text-orange-600">{processedChartData.totalPoints}</Text>
          </View>
          <View className="items-center">
            <Text className="font-semibold text-gray-600">Duration</Text>
            <Text className="text-lg font-bold text-orange-600">{getRangeDurationDisplay()}</Text>
          </View>
        </View>
      </View>
      {noDataForCriteria ? (
        <View className="bg-white p-4 rounded-xl my-4 items-center justify-center h-64 shadow-md">
          <Text className="text-lg font-semibold text-red-500">No data available for selected criteria.</Text>
        </View>
      ) : (
        <View>
          {/* Temperature Chart */}
          {processedChartData.tempPoints.length > 0 && (
            <View className="bg-white p-3 rounded-xl my-4 shadow-md">
              <Text className="text-center text-lg font-bold mb-2 text-gray-700">Temperature (°C)</Text>
              <ScrollView horizontal>
                <LineChart
                  data={processedChartData.tempPoints}
                  width={Math.max(screenWidth, processedChartData.tempPoints.length * 40)} // Dynamic width
                  height={220}
                  yAxisSuffix="°C"
                  xAxisLabelRotation={processedChartData.tempPoints.length > 10 ? 45 : 0}
                  curved
                  areaChart
                  hideRules
                  startFillColor="rgba(255, 140, 0, 0.3)"
                  endFillColor="rgba(255, 140, 0, 0.05)"
                  startOpacity={0.8}
                  endOpacity={0.1}
                  color="#FF8C00"
                  noOfSections={4}
                  yAxisTextStyle={{ color: "gray" }}
                  spacing={
                    processedChartData.tempPoints.length > 1
                      ? (Math.max(screenWidth, processedChartData.tempPoints.length * 40) / (processedChartData.tempPoints.length - 1)) * 0.8
                      : 50
                  }
                  initialSpacing={10}
                  endSpacing={10}
                />
              </ScrollView>
            </View>
          )}

          {/* Rainfall Chart */}
          {processedChartData.rainPoints.length > 0 && (
            <View className="bg-white p-3 rounded-xl my-4 shadow-md">
              <Text className="text-center text-lg font-bold mb-2 text-gray-700">Rain (mm)</Text>
              <ScrollView horizontal>
                <LineChart
                  data={processedChartData.rainPoints}
                  width={Math.max(screenWidth, processedChartData.rainPoints.length * 40)}
                  height={220}
                  yAxisSuffix="mm"
                  xAxisLabelRotation={processedChartData.rainPoints.length > 10 ? 45 : 0}
                  curved
                  areaChart
                  hideRules
                  startFillColor="rgba(0, 150, 255, 0.3)"
                  endFillColor="rgba(0, 150, 255, 0.05)"
                  startOpacity={0.8}
                  endOpacity={0.1}
                  color="#0096FF"
                  noOfSections={4}
                  yAxisTextStyle={{ color: "gray" }}
                  spacing={
                    processedChartData.rainPoints.length > 1
                      ? (Math.max(screenWidth, processedChartData.rainPoints.length * 40) / (processedChartData.rainPoints.length - 1)) * 0.8
                      : 50
                  }
                  initialSpacing={10}
                  endSpacing={10}
                />
              </ScrollView>
            </View>
          )}

          {/* Precipitation Probability Chart */}
          {processedChartData.precipPoints.length > 0 && (
            <View className="bg-white p-3 rounded-xl mb-16 shadow-md">
              <Text className="text-center text-lg font-bold mb-2 text-gray-700">Chance of Rain (%)</Text>
              <ScrollView horizontal>
                <LineChart
                  data={processedChartData.precipPoints}
                  width={Math.max(screenWidth, processedChartData.precipPoints.length * 40)}
                  height={220}
                  yAxisSuffix="%"
                  xAxisLabelRotation={processedChartData.precipPoints.length > 10 ? 45 : 0}
                  curved
                  areaChart
                  hideRules
                  startFillColor="rgba(76, 175, 80, 0.3)"
                  endFillColor="rgba(76, 175, 80, 0.05)"
                  startOpacity={0.8}
                  endOpacity={0.1}
                  color="#4CAF50"
                  noOfSections={4}
                  yAxisTextStyle={{ color: "gray" }}
                  spacing={
                    processedChartData.precipPoints.length > 1
                      ? (Math.max(screenWidth, processedChartData.precipPoints.length * 40) / (processedChartData.precipPoints.length - 1)) * 0.8
                      : 50
                  }
                  initialSpacing={10}
                  endSpacing={10}
                />
              </ScrollView>
            </View>
          )}
        </View>
      )}
      <View className="h-5" />
    </ScrollView>
  );
};

export default AnalyticsWidget;
