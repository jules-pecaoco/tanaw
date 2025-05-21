import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { fetchWeatherData } from "@/services/openmeteo";

// Hardcoded cities (assuming this is correct)
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

const Y_AXIS_WIDTH = 50;
const CHART_HEIGHT = 220;
const CHART_TOP_PADDING = 15; // Adjusted slightly, fine-tune as needed
const CHART_X_AXIS_SPACE = 40; // Adjusted slightly, for X-axis label room

const yAxisTextStyleGlobal = { color: "gray", fontSize: 10 };
const xAxisLabelTextStyleGlobal = { color: "gray", fontSize: 10, height: CHART_X_AXIS_SPACE - 10 }; // Give some height

// FixedYAxisLabels Component (No changes from previous working version)
const FixedYAxisLabels = ({ containerHeight, paddingTop, paddingBottom, maxValue, minValue = 0, noOfSections, yAxisSuffix, textStyle }) => {
  const labels = useMemo(() => {
    if (maxValue === undefined || maxValue === null || noOfSections === 0 || minValue === undefined || minValue === null) return [];
    if (maxValue === minValue) {
      // Handle case where min and max are the same
      const lbls = [];
      for (let i = 0; i <= noOfSections; i++) {
        lbls.push(maxValue);
      }
      return lbls.reverse();
    }

    const generatedLabels = [];
    const step = (maxValue - minValue) / noOfSections;

    for (let i = 0; i <= noOfSections; i++) {
      let val = minValue + i * step;
      // Ensure last label is exactly maxValue, first is minValue
      if (i === 0) val = minValue;
      else if (i === noOfSections) val = maxValue;

      generatedLabels.push(Number.isInteger(val) ? val : parseFloat(val.toFixed(1)));
    }
    return generatedLabels.reverse();
  }, [maxValue, minValue, noOfSections]);

  if (labels.length === 0) {
    return <View style={{ width: Y_AXIS_WIDTH, height: containerHeight }} />;
  }

  return (
    <View
      style={{
        width: Y_AXIS_WIDTH,
        height: containerHeight,
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
        justifyContent: "space-between",
        // backgroundColor: 'lightyellow' // For debugging alignment
      }}
    >
      {labels.map((labelValue, index) => (
        <Text key={index} style={[textStyle, styles.yAxisLabelText]}>
          {labelValue}
          {yAxisSuffix}
        </Text>
      ))}
    </View>
  );
};

// Placeholder for No Data / Flat Data
const ChartPlaceholder = ({ message, height = CHART_HEIGHT }) => (
  <View style={[styles.chartPlaceholderContainer, { height }]}>
    <Text style={styles.chartPlaceholderText}>{message}</Text>
  </View>
);

const checkChartDataStatus = (points, unit = "", name = "Data") => {
  if (!points || points.length === 0) {
    return { isEmpty: true, isFlat: false, message: `No ${name.toLowerCase()} available for the selected criteria.` };
  }
  // Check if all *numeric* values are 0. Some chart libraries might add non-numeric stuff.
  const numericValues = points.map((p) => p.value).filter((v) => typeof v === "number");
  if (numericValues.length === 0 && points.length > 0) {
    // Contains points, but no numeric values (unlikely for this setup)
    return { isEmpty: true, isFlat: false, message: `Invalid ${name.toLowerCase()} for the selected criteria.` };
  }
  if (numericValues.length > 0 && numericValues.every((v) => v === 0)) {
    return { isEmpty: false, isFlat: true, message: `${name} is uniformly 0${unit}.` };
  }
  return { isEmpty: false, isFlat: false, message: "" };
};

const AnalyticsWidget = () => {
  const screenWidth = Dimensions.get("window").width - 40;

  const [rawData, setRawData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState("Bacolod City");
  const [selectedRangeType, setSelectedRangeType] = useState("hourly");

  const [minDataDate, setMinDataDate] = useState(null);
  const [maxDataDate, setMaxDataDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [filterMode, setFilterMode] = useState("preset");
  const [presetRange, setPresetRange] = useState("3days");

  // Fetching data effect (no changes from previous, assuming it's correct)
  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const weatherData = await fetchWeatherData(selectedCity, cities[selectedCity].lat, cities[selectedCity].lon);
        setRawData(weatherData);
        if (weatherData?.daily?.time && weatherData.daily.time.length > 0) {
          const firstDate = new Date(weatherData.daily.time[0]);
          const lastDate = new Date(weatherData.daily.time[weatherData.daily.time.length - 1]);
          setMinDataDate(firstDate);
          setMaxDataDate(lastDate);
          const threeDaysAgo = new Date(lastDate);
          threeDaysAgo.setDate(lastDate.getDate() - 2);
          setStartDate(threeDaysAgo < firstDate ? new Date(firstDate) : threeDaysAgo);
          setEndDate(new Date(lastDate));
        } else if (weatherData?.hourly?.time && weatherData.hourly.time.length > 0) {
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
          const today = new Date();
          setMinDataDate(today);
          setMaxDataDate(today);
          setStartDate(today);
          setEndDate(today);
        }
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(err.message || "Failed to fetch weather data");
        setRawData(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadWeatherData();
  }, [selectedCity]);

  // Preset range effect (no changes)
  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset") return;
    let newStart = new Date(minDataDate);
    let newEnd = new Date(maxDataDate);
    const dataContextEndDate = new Date(maxDataDate);
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
        break;
    }
    setStartDate(newStart < minDataDate ? new Date(minDataDate) : newStart);
    setEndDate(newEnd > maxDataDate ? new Date(maxDataDate) : newEnd);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  // Data processing
  const processedChartData = useMemo(() => {
    const baseReturn = { tempPoints: [], rainPoints: [], precipPoints: [], totalPoints: 0, tempStats: {}, rainStats: {}, precipStats: {} };
    if (!rawData || (!rawData.hourly?.time && !rawData.daily?.time)) return baseReturn;
    const source = selectedRangeType === "hourly" ? rawData.hourly : rawData.daily;
    if (!source || !source.time || source.time.length === 0) return baseReturn;

    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

    const filteredIndices = [];
    source.time.forEach((timeStr, index) => {
      const itemDate = new Date(timeStr);
      if (itemDate >= startDay && itemDate <= endDay) filteredIndices.push(index);
    });

    if (filteredIndices.length === 0) return baseReturn;

    const tempValues = [],
      rainValues = [],
      precipValues = [],
      timeLabels = [];
    filteredIndices.forEach((index) => {
      tempValues.push(source.temperature_2m?.[index] ?? source.temperature80m?.[index] ?? 0);
      rainValues.push(source.rain?.[index] ?? 0);
      precipValues.push(source.precipitation_probability?.[index] ?? source.precipitationProbability?.[index] ?? 0);
      const timeStr = source.time[index];
      timeLabels.push(selectedRangeType === "hourly" ? timeStr.split("T")[1].slice(0, 5) : timeStr.split("T")[0].slice(5));
    });

    const commonDataPointProps = (dataPointColor, yAxisSuffixText) => ({
      dataPointColor,
      yAxisSuffix: yAxisSuffixText,
      // These labelTextStyles are for the X-AXIS LABELS associated with this data point
      labelTextStyle: { ...xAxisLabelTextStyleGlobal }, // Use global style for consistency
    });

    const getMinMax = (values, defaultMin = 0, defaultMax = 10, allowNegativeMin = false) => {
      if (!values || values.length === 0) return { min: defaultMin, max: defaultMax, dataPresent: false };
      let minVal = values[0],
        maxVal = values[0];
      values.forEach((v) => {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      });
      if (!allowNegativeMin && minVal < 0) minVal = 0; // e.g. for rain

      // Ensure a visible range if all values are the same
      if (minVal === maxVal) {
        if (minVal === 0) return { min: 0, max: defaultMax, dataPresent: true }; // All zeros, show default range
        // All same non-zero value, create a small range around it
        return { min: minVal - (Math.abs(minVal * 0.1) || 1), max: maxVal + (Math.abs(maxVal * 0.1) || 1), dataPresent: true };
      }
      return { min: minVal, max: maxVal, dataPresent: true };
    };

    const tempStats = getMinMax(tempValues, -5, 30, true);
    const rainStats = getMinMax(rainValues, 0, 10, false);
    const precipStats = getMinMax(precipValues, 0, 100, false); // technically min should be 0, max 100 always for prob.
    // Overwrite precipStats if data is present, as it must be 0-100
    if (precipStats.dataPresent) {
      precipStats.min = 0;
      precipStats.max = 100;
    }

    return {
      tempPoints: tempValues.map((value, i) => ({ value, label: timeLabels[i], ...commonDataPointProps("#FF8C00", "°C") })),
      rainPoints: rainValues.map((value, i) => ({ value, label: timeLabels[i], ...commonDataPointProps("#0096FF", "mm") })),
      precipPoints: precipValues.map((value, i) => ({ value, label: timeLabels[i], ...commonDataPointProps("#4CAF50", "%") })),
      totalPoints: filteredIndices.length,
      tempStats,
      rainStats,
      precipStats,
    };
  }, [rawData, selectedRangeType, startDate, endDate]);

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  // Common Pointer Configuration
  const pointerConfig = useMemo(
    () => ({
      // Memoize pointerConfig as well
      activatePointersOnLongPress: true,
      activatePointersDelay: 150, // Slightly faster activation
      persistPointer: true, // Should make it stay after long press
      pointerVanishDelay: 3000, // How long it stays after finger lift
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 120,
      pointerLabelHeight: 60,
      pointerStripHeight: CHART_HEIGHT - CHART_TOP_PADDING - CHART_X_AXIS_SPACE, // Full height of plot area
      pointerStripColor: "lightgray",
      pointerStripWidth: 1,
      pointerColor: "dimgray",
      radius: 8, // Slightly larger touch radius
      pointerLabelComponent: (items) => {
        // console.log('Pointer items:', JSON.stringify(items)); // DEBUG: Check if this logs for all charts
        if (!items || items.length === 0 || !items[0] || items[0].value === undefined) {
          // console.log('Pointer: No items or invalid item[0]');
          return null;
        }
        const item = items[0];
        return (
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipValue}>
              {item.value}
              {item.yAxisSuffix || ""}
            </Text>
            {item.label && <Text style={styles.tooltipLabel}>Time: {item.label}</Text>}
          </View>
        );
      },
    }),
    [CHART_HEIGHT, CHART_TOP_PADDING, CHART_X_AXIS_SPACE]
  ); // Dependencies if any values change

  if (isLoading) return <ActivityIndicator size="large" color="#FF8C00" />;
  if (error)
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-200">
        {" "}
        <Text className="text-red-500 font-rbold text-center">Error: {error}</Text>{" "}
        <Text className="text-gray-600 text-center mt-2">
          {" "}
          Could not load weather data for {selectedCity}. Please try again or select a different city.{" "}
        </Text>{" "}
      </View>
    );

  const noDataForAllCriteria = processedChartData.totalPoints === 0; // Overall check
  const scrollableChartAreaWidth = screenWidth - Y_AXIS_WIDTH;

  // Individual chart data status
  const tempStatus = checkChartDataStatus(processedChartData.tempPoints, "°C", "Temperature data");
  const rainStatus = checkChartDataStatus(processedChartData.rainPoints, "mm", "Rain data");
  const precipStatus = checkChartDataStatus(processedChartData.precipPoints, "%", "Precipitation data");

  const commonLineChartProps = (dataPoints, stats, color, startFill, endFill) => ({
    data: dataPoints,
    width: Math.max(scrollableChartAreaWidth, dataPoints.length * 40), // Auto-scroll if content exceeds view
    height: CHART_HEIGHT,

    // Y-Axis managed by FixedYAxisLabels, but chart needs scale
    maxValue: stats.max,
    mostNegativeValue: stats.min < 0 ? stats.min : undefined, // Only if min is actually negative
    minValue: stats.min >= 0 ? stats.min : undefined, // Only if min is zero or positive
    noOfSections: 4, // Should match FixedYAxisLabels

    // Hide internal Y-axis visuals
    hideYAxisText: true,
    yAxisThickness: 0,
    yAxisColor: "transparent",

    // X-Axis visuals (ensure line and labels are attempted to be drawn)
    xAxisThickness: 0.5,
    xAxisColor: "lightgray",
    xAxisLabelTextStyle: xAxisLabelTextStyleGlobal, // Global style for X-axis labels
    xAxisLabelRotation: dataPoints.length > 10 ? 45 : 0,
    xAxisIndicesHeight: 5, // Small ticks on x-axis
    xAxisIndicesColor: "lightgray",

    curved: true,
    areaChart: true,
    hideRules: true, // Hides vertical grid lines, horizontal are still controlled by sections if rules are not hidden
    rulesType: "solid", // For horizontal section lines
    rulesColor: "rgba(200,200,200,0.2)", // Light horizontal lines

    startFillColor: startFill,
    endFillColor: endFill,
    startOpacity: 0.8,
    endOpacity: 0.1,
    color: color,

    initialSpacing: dataPoints.length === 1 ? scrollableChartAreaWidth / 2 - 20 : 15, // Center single point / default initial
    endSpacing: 15,
    // Let the library auto-calculate spacing based on width and number of points
    // remove `spacing` prop unless specific control is needed and auto doesn't work well.

    pointerConfig: pointerConfig, // Interactive tooltips
    isAnimated: false, // Try disabling animation if tooltips are jumpy
    animationDuration: 150, // If animated, keep it short
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-gray-200 w-[100%] px-4">
      {/* City Picker & Date Range UI (no changes from previous) */}
      <View className="bg-white rounded-xl mb-4 shadow-md">
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
          style={{ height: 50, width: "100%" }}
          itemStyle={{ fontFamily: "System" }}
        >
          {Object.keys(cities).map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
      <View className="bg-white p-4 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-rbold mb-4 text-gray-700">Date Range Selector</Text>
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-xl ${filterMode === "preset" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-rsemibold ${filterMode === "preset" ? "text-white" : "text-gray-700"}`}>Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-xl ${filterMode === "custom" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setFilterMode("custom")}
          >
            <Text className={`font-rsemibold ${filterMode === "custom" ? "text-white" : "text-gray-700"}`}>Custom</Text>
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
                className={`px-3 py-2 m-1 rounded-xl ${presetRange === range.value ? "bg-primary" : "bg-gray-200"}`}
                onPress={() => setPresetRange(range.value)}
                disabled={!minDataDate || !maxDataDate}
              >
                <Text className={`font-rsemibold ${presetRange === range.value ? "text-white" : "text-gray-700"}`}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {filterMode === "custom" && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-rsemibold text-gray-700">Start Date:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-xl">
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
              <Text className="font-rsemibold text-gray-700">End Date:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-xl">
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
        <View className="bg-gray-200 p-2 rounded-xl mt-3">
          <Text className="text-center text-sm text-gray-600">
            {" "}
            Showing data: {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}{" "}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-center mb-4">
        {["hourly", "daily"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 mx-2 rounded-xl ${selectedRangeType === type ? "bg-primary" : "bg-secondary"}`}
            onPress={() => setSelectedRangeType(type)}
          >
            <Text className="font-rsemibold text-lg text-white">{type.charAt(0).toUpperCase() + type.slice(1)} Data</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="bg-white p-3 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Data Summary</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="font-rsemibold text-gray-600">Data Points</Text>
            <Text className="text-lg font-rbold text-orange-600">{processedChartData.totalPoints}</Text>
          </View>
          <View className="items-center">
            <Text className="font-rsemibold text-gray-600">Duration</Text>
            <Text className="text-lg font-rbold text-orange-600">{getRangeDurationDisplay()}</Text>
          </View>
        </View>
      </View>

      {noDataForAllCriteria ? ( // If NO data for ANY chart based on current criteria
        <View className="bg-white p-4 rounded-xl my-4 items-center justify-center h-64 shadow-md">
          <Text className="text-lg font-rsemibold text-red-500">No data available for selected city or date range.</Text>
        </View>
      ) : (
        <View>
          {/* Temperature Chart */}
          <View className="bg-white p-3 rounded-xl my-4 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Temperature (°C)</Text>
            {tempStatus.isEmpty || tempStatus.isFlat ? (
              <ChartPlaceholder message={tempStatus.message} />
            ) : (
              <View style={styles.chartRowContainer}>
                <FixedYAxisLabels
                  containerHeight={CHART_HEIGHT}
                  paddingTop={CHART_TOP_PADDING}
                  paddingBottom={CHART_X_AXIS_SPACE}
                  maxValue={processedChartData.tempStats.max}
                  minValue={processedChartData.tempStats.min}
                  noOfSections={4}
                  yAxisSuffix="°C"
                  textStyle={yAxisTextStyleGlobal}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
                  <LineChart
                    {...commonLineChartProps(
                      processedChartData.tempPoints,
                      processedChartData.tempStats,
                      "#FF8C00",
                      "rgba(255, 140, 0, 0.3)",
                      "rgba(255, 140, 0, 0.05)"
                    )}
                  />
                </ScrollView>
              </View>
            )}
          </View>

          {/* Rainfall Chart */}
          <View className="bg-white p-3 rounded-xl my-4 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Rain (mm)</Text>
            {rainStatus.isEmpty || rainStatus.isFlat ? (
              <ChartPlaceholder message={rainStatus.message} />
            ) : (
              <View style={styles.chartRowContainer}>
                <FixedYAxisLabels
                  containerHeight={CHART_HEIGHT}
                  paddingTop={CHART_TOP_PADDING}
                  paddingBottom={CHART_X_AXIS_SPACE}
                  maxValue={processedChartData.rainStats.max}
                  minValue={processedChartData.rainStats.min}
                  noOfSections={4}
                  yAxisSuffix="mm"
                  textStyle={yAxisTextStyleGlobal}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
                  <LineChart
                    {...commonLineChartProps(
                      processedChartData.rainPoints,
                      processedChartData.rainStats,
                      "#0096FF",
                      "rgba(0, 150, 255, 0.3)",
                      "rgba(0, 150, 255, 0.05)"
                    )}
                  />
                </ScrollView>
              </View>
            )}
          </View>

          {/* Precipitation Probability Chart */}
          <View className="bg-white p-3 rounded-xl mb-16 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Chance of Rain (%)</Text>
            {precipStatus.isEmpty || precipStatus.isFlat ? (
              <ChartPlaceholder message={precipStatus.message} />
            ) : (
              <View style={styles.chartRowContainer}>
                <FixedYAxisLabels
                  containerHeight={CHART_HEIGHT}
                  paddingTop={CHART_TOP_PADDING}
                  paddingBottom={CHART_X_AXIS_SPACE}
                  maxValue={processedChartData.precipStats.max}
                  minValue={processedChartData.precipStats.min}
                  noOfSections={4}
                  yAxisSuffix="%"
                  textStyle={yAxisTextStyleGlobal}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
                  <LineChart
                    {...commonLineChartProps(
                      processedChartData.precipPoints,
                      processedChartData.precipStats,
                      "#4CAF50",
                      "rgba(76, 175, 80, 0.3)",
                      "rgba(76, 175, 80, 0.05)"
                    )}
                  />
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      )}
      <View className="h-5" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chartRowContainer: {
    flexDirection: "row",
    // height: CHART_HEIGHT, // Height is implicitly defined by children
    marginTop: 8,
  },
  chartScrollView: {
    flex: 1,
  },
  yAxisLabelText: {
    textAlign: "right",
    paddingRight: 5,
  },
  tooltipContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Darker tooltip
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    // Shadow for tooltip (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for tooltip (Android)
    elevation: 5,
  },
  tooltipValue: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  tooltipLabel: {
    color: "lightgray", // Lighter secondary text
    fontSize: 12,
    marginTop: 3,
  },
  chartPlaceholderContainer: {
    // height: CHART_HEIGHT, // Set by prop
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa", // Lighter placeholder background
    borderRadius: 8,
    marginVertical: 10, // Consistent with chart card margins
    padding: 20,
  },
  chartPlaceholderText: {
    color: "#6c757d", // Bootstrap's muted text color
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AnalyticsWidget;
