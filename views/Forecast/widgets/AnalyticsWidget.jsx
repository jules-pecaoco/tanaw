import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const Y_AXIS_WIDTH = 50;
const CHART_HEIGHT = 220;
const CHART_TOP_PADDING = 15;
const CHART_X_AXIS_LABEL_AREA_HEIGHT = 40;
const X_AXIS_SPACING_PER_ITEM = 50;
const DEFAULT_CHART_HORIZONTAL_PADDING = 15;
const LOGICAL_TODAY_OFFSET_DAYS = 7; // New constant for the 7-day offset

const yAxisTextStyleGlobal = { color: "gray", fontSize: 10 };
const xAxisLabelTextStyleGlobal = { color: "gray", fontSize: 10, height: CHART_X_AXIS_LABEL_AREA_HEIGHT - 10 };

const parseYYYYMMDDToLocalMidnight = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return new Date();
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date(dateStr);
  return new Date(year, month, day, 0, 0, 0, 0);
};

const FixedYAxisLabels = ({ containerHeight, paddingTop, paddingBottom, maxValue, minValue = 0, noOfSections, yAxisSuffix, textStyle }) => {
  const labels = useMemo(() => {
    if (maxValue === undefined || maxValue === null || noOfSections === 0 || minValue === undefined || minValue === null) return [];
    if (maxValue === minValue) {
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

const AnalyticsWidget = ({ rawData, isLoading, error, selectedCity, onCityChange, cities }) => {
  const screenWidth = Dimensions.get("window").width - 40;
  const [selectedRangeType, setSelectedRangeType] = useState("hourly");
  const [minDataDate, setMinDataDate] = useState(null); // Actual earliest date in data
  const [maxDataDate, setMaxDataDate] = useState(null); // Actual latest date in data
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filterMode, setFilterMode] = useState("preset");
  const [presetRange, setPresetRange] = useState("3days");

  useEffect(() => {
    const systemTodayAtMidnight = new Date();
    systemTodayAtMidnight.setHours(0, 0, 0, 0);

    if (rawData) {
      let firstDateCandidate, lastDateCandidate;
      if (rawData.daily?.time && rawData.daily.time.length > 0) {
        firstDateCandidate = parseYYYYMMDDToLocalMidnight(rawData.daily.time[0]);
        lastDateCandidate = parseYYYYMMDDToLocalMidnight(rawData.daily.time[rawData.daily.time.length - 1]);
      } else if (rawData.hourly?.time && rawData.hourly.time.length > 0) {
        const firstHourlyFullDate = new Date(rawData.hourly.time[0]);
        firstDateCandidate = new Date(firstHourlyFullDate.getFullYear(), firstHourlyFullDate.getMonth(), firstHourlyFullDate.getDate(), 0, 0, 0, 0);
        const lastHourlyFullDate = new Date(rawData.hourly.time[rawData.hourly.time.length - 1]);
        lastDateCandidate = new Date(lastHourlyFullDate.getFullYear(), lastHourlyFullDate.getMonth(), lastHourlyFullDate.getDate(), 0, 0, 0, 0);
      }

      if (firstDateCandidate && lastDateCandidate && !isNaN(firstDateCandidate.getTime()) && !isNaN(lastDateCandidate.getTime())) {
        const actualMinData = new Date(firstDateCandidate);
        const actualMaxData = new Date(lastDateCandidate);
        setMinDataDate(actualMinData);
        setMaxDataDate(actualMaxData);

        // Determine the logical start for the default view (actualMinData + offset)
        let logicalInitialViewStart = new Date(actualMinData);
        logicalInitialViewStart.setDate(actualMinData.getDate() + LOGICAL_TODAY_OFFSET_DAYS);
        logicalInitialViewStart.setHours(0, 0, 0, 0);

        // Default view is "3days" from this logicalInitialViewStart
        let sDate = new Date(logicalInitialViewStart);
        let eDate = new Date(logicalInitialViewStart);
        eDate.setDate(logicalInitialViewStart.getDate() + 2); // For 3 days total

        // Clamp sDate and eDate to the actual available data range [actualMinData, actualMaxData]
        sDate = sDate < actualMinData ? new Date(actualMinData) : sDate;
        sDate = sDate > actualMaxData ? new Date(actualMaxData) : sDate;

        eDate = eDate < actualMinData ? new Date(actualMinData) : eDate;
        eDate = eDate > actualMaxData ? new Date(actualMaxData) : eDate;

        if (sDate > eDate) {
          // If clamping made start after end, set to a single day (eDate)
          sDate = new Date(eDate);
        }

        setStartDate(sDate);
        setEndDate(eDate);
      } else {
        setMinDataDate(new Date(systemTodayAtMidnight));
        setMaxDataDate(new Date(systemTodayAtMidnight));
        setStartDate(new Date(systemTodayAtMidnight));
        setEndDate(new Date(systemTodayAtMidnight));
      }
    } else {
      setMinDataDate(new Date(systemTodayAtMidnight));
      setMaxDataDate(new Date(systemTodayAtMidnight));
      setStartDate(new Date(systemTodayAtMidnight));
      setEndDate(new Date(systemTodayAtMidnight));
    }
  }, [rawData]);

  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset" || isNaN(minDataDate.getTime()) || isNaN(maxDataDate.getTime())) {
      return;
    }

    // Define the user's logical "Today" (actual start of data + offset)
    let logicalTodayForPresets = new Date(minDataDate);
    logicalTodayForPresets.setDate(minDataDate.getDate() + LOGICAL_TODAY_OFFSET_DAYS);
    logicalTodayForPresets.setHours(0, 0, 0, 0);

    let newStartCalc = new Date(minDataDate); // Default for 'all'
    let newEndCalc = new Date(maxDataDate); // Default for 'all'

    switch (presetRange) {
      case "today": // User's "Today"
        newStartCalc = new Date(logicalTodayForPresets);
        newEndCalc = new Date(logicalTodayForPresets);
        break;
      case "3days": // 3 days starting from user's "Today"
        newStartCalc = new Date(logicalTodayForPresets);
        newEndCalc = new Date(logicalTodayForPresets);
        newEndCalc.setDate(logicalTodayForPresets.getDate() + 2);
        break;
      case "week": // 7 days starting from user's "Today"
        newStartCalc = new Date(logicalTodayForPresets);
        newEndCalc = new Date(logicalTodayForPresets);
        newEndCalc.setDate(logicalTodayForPresets.getDate() + 6);
        break;
      case "all":
        // newStartCalc and newEndCalc are already minDataDate and maxDataDate
        break;
    }

    newStartCalc.setHours(0, 0, 0, 0);
    newEndCalc.setHours(0, 0, 0, 0);

    // Clamp calculated dates to the *actual* available data range [minDataDate, maxDataDate]
    let finalStartDate = newStartCalc < minDataDate ? new Date(minDataDate) : newStartCalc;
    finalStartDate = finalStartDate > maxDataDate ? new Date(maxDataDate) : finalStartDate;

    let finalEndDate = newEndCalc < minDataDate ? new Date(minDataDate) : newEndCalc;
    finalEndDate = finalEndDate > maxDataDate ? new Date(maxDataDate) : finalEndDate;

    if (finalStartDate > finalEndDate) {
      finalStartDate = new Date(finalEndDate);
    }

    setStartDate(finalStartDate);
    setEndDate(finalEndDate);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  const processedChartData = useMemo(() => {
    const baseReturn = { tempPoints: [], rainPoints: [], precipPoints: [], totalPoints: 0, tempStats: {}, rainStats: {}, precipStats: {} };
    if (
      !rawData ||
      (!rawData.hourly?.time && !rawData.daily?.time) ||
      !startDate ||
      !endDate ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return baseReturn;
    }
    const source = selectedRangeType === "hourly" ? rawData.hourly : rawData.daily;
    if (!source || !source.time || source.time.length === 0) return baseReturn;

    const filterStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
    const filterEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

    const filteredIndices = [];
    source.time.forEach((timeStr, index) => {
      let itemDate;
      if (selectedRangeType === "hourly") itemDate = new Date(timeStr);
      else itemDate = parseYYYYMMDDToLocalMidnight(timeStr);
      if (!isNaN(itemDate.getTime()) && itemDate >= filterStart && itemDate <= filterEnd) {
        filteredIndices.push(index);
      }
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
      timeLabels.push(selectedRangeType === "hourly" ? timeStr.split("T")[1].slice(0, 5) : timeStr.slice(5));
    });

    const commonDataPointProps = (dataPointColor, yAxisSuffixText) => ({
      dataPointColor,
      yAxisSuffix: yAxisSuffixText,
      labelTextStyle: { ...xAxisLabelTextStyleGlobal },
    });
    const getMinMax = (values, defaultMin = 0, defaultMax = 10, allowNegativeMin = false) => {
      if (!values || values.length === 0) return { min: defaultMin, max: defaultMax, dataPresent: false };
      let minVal = values[0],
        maxVal = values[0];
      values.forEach((v) => {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      });
      if (!allowNegativeMin && minVal < 0) minVal = 0;
      if (minVal === maxVal) {
        if (minVal === 0 && defaultMax > 0) return { min: 0, max: defaultMax, dataPresent: true };
        if (minVal === 0 && defaultMax <= 0) return { min: 0, max: 1, dataPresent: true };
        return { min: minVal - (Math.abs(minVal * 0.1) || 1), max: maxVal + (Math.abs(maxVal * 0.1) || 1), dataPresent: true };
      }
      return { min: minVal, max: maxVal, dataPresent: true };
    };
    const tempStats = getMinMax(tempValues, -5, 30, true);
    const rainStats = getMinMax(rainValues, 0, 10, false);
    const precipStats = getMinMax(precipValues, 0, 100, false);
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
    if (selectedDate && minDataDate && endDate && !isNaN(minDataDate.getTime()) && !isNaN(endDate.getTime())) {
      let newStartDate = new Date(selectedDate);
      newStartDate.setHours(0, 0, 0, 0);
      if (newStartDate < minDataDate) newStartDate = new Date(minDataDate);
      if (newStartDate > endDate) newStartDate = new Date(endDate);
      setStartDate(newStartDate);
    }
  };
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate && maxDataDate && startDate && !isNaN(maxDataDate.getTime()) && !isNaN(startDate.getTime())) {
      let newEndDate = new Date(selectedDate);
      newEndDate.setHours(0, 0, 0, 0);
      if (newEndDate > maxDataDate) newEndDate = new Date(maxDataDate);
      if (newEndDate < startDate) newEndDate = new Date(startDate);
      setEndDate(newEndDate);
    }
  };
  const formatDateForDisplay = (date) => {
    if (!date || isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  const getRangeDurationDisplay = () => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "0 days";
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  const pointerConfig = useMemo(
    () => ({
      activatePointersOnLongPress: true,
      activatePointersDelay: 150,
      persistPointer: true,
      pointerVanishDelay: 3000,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 120,
      pointerLabelHeight: 60,
      pointerStripHeight: CHART_HEIGHT - CHART_TOP_PADDING - CHART_X_AXIS_LABEL_AREA_HEIGHT,
      pointerStripColor: "lightgray",
      pointerStripWidth: 1,
      pointerColor: "dimgray",
      radius: 8,
      pointerLabelComponent: (items) => {
        if (!items || items.length === 0 || !items[0] || items[0].value === undefined) return null;
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
    [CHART_HEIGHT, CHART_TOP_PADDING, CHART_X_AXIS_LABEL_AREA_HEIGHT]
  );

  if (isLoading) return <ActivityIndicator size="large" color="#FF8C00" />;
  if (error)
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-200">
        <Text className="text-red-500 font-rbold text-center">Error: {error}</Text>
        <Text className="text-gray-600 text-center mt-2">
          Could not load weather data for {selectedCity}. Please try again or select a different city.
        </Text>
      </View>
    );

  const noDataForAllCriteria = processedChartData.totalPoints === 0;
  const scrollableChartAreaWidth = screenWidth - Y_AXIS_WIDTH;

  const commonLineChartProps = (dataPoints, stats, color, startFill, endFill) => {
    const numPoints = dataPoints.length;
    let chartRenderWidth,
      currentInitialSpacing = DEFAULT_CHART_HORIZONTAL_PADDING,
      currentEndSpacing = DEFAULT_CHART_HORIZONTAL_PADDING,
      pointSpacing = X_AXIS_SPACING_PER_ITEM;
    if (numPoints === 0) {
      chartRenderWidth = scrollableChartAreaWidth;
      currentInitialSpacing = 0;
      currentEndSpacing = 0;
      pointSpacing = 0;
    } else if (numPoints === 1) {
      chartRenderWidth = scrollableChartAreaWidth;
      currentInitialSpacing = Math.max(DEFAULT_CHART_HORIZONTAL_PADDING, (scrollableChartAreaWidth - X_AXIS_SPACING_PER_ITEM) / 2);
      currentEndSpacing = chartRenderWidth - currentInitialSpacing - X_AXIS_SPACING_PER_ITEM;
      currentEndSpacing = Math.max(DEFAULT_CHART_HORIZONTAL_PADDING, currentEndSpacing);
      chartRenderWidth = Math.max(scrollableChartAreaWidth, currentInitialSpacing + X_AXIS_SPACING_PER_ITEM + currentEndSpacing);
      pointSpacing = X_AXIS_SPACING_PER_ITEM;
    } else {
      const idealContentWidth = currentInitialSpacing + pointSpacing * (numPoints - 1) + currentEndSpacing;
      chartRenderWidth = Math.max(scrollableChartAreaWidth, idealContentWidth);
    }
    return {
      data: dataPoints,
      width: chartRenderWidth,
      height: CHART_HEIGHT,
      maxValue: stats.max,
      mostNegativeValue: stats.min < 0 ? stats.min : undefined,
      minValue: stats.min >= 0 ? stats.min : 0,
      noOfSections: 4,
      hideYAxisText: true,
      yAxisThickness: 0,
      yAxisColor: "transparent",
      xAxisThickness: 0.5,
      xAxisColor: "lightgray",
      xAxisLabelTextStyle: xAxisLabelTextStyleGlobal,
      xAxisLabelRotation: numPoints > chartRenderWidth / (X_AXIS_SPACING_PER_ITEM * 0.7) ? 45 : 0,
      xAxisIndicesHeight: 5,
      xAxisIndicesColor: "lightgray",
      curved: true,
      areaChart: true,
      hideRules: true,
      rulesType: "solid",
      rulesColor: "rgba(200,200,200,0.2)",
      startFillColor: startFill,
      endFillColor: endFill,
      startOpacity: 0.8,
      endOpacity: 0.1,
      color: color,
      spacing: pointSpacing,
      initialSpacing: currentInitialSpacing,
      endSpacing: currentEndSpacing,
      pointerConfig: pointerConfig,
      isAnimated: false,
    };
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-gray-200 w-[100%] px-4">
      <View className="bg-white rounded-xl mb-4 shadow-md">
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => onCityChange(itemValue)}
          style={{ height: 50, width: "100%" }}
          itemStyle={{ fontFamily: "System" }}
        >
          {Object.keys(cities).map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
      <View className="bg-white p-4 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-rbold mb-4 text-gray-700">Date Range</Text>
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-xl ${filterMode === "preset" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-rmedium ${filterMode === "preset" ? "text-white" : "text-gray-700"}`}>Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 mx-2 rounded-xl ${filterMode === "custom" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setFilterMode("custom")}
          >
            <Text className={`font-rmedium ${filterMode === "custom" ? "text-white" : "text-gray-700"}`}>Custom</Text>
          </TouchableOpacity>
        </View>
        {filterMode === "preset" && (
          <View className="flex-row flex-wrap justify-center mb-2">
            {[
              { label: "Today", value: "today" },
              { label: "3 Days", value: "3days" },
              { label: "1 Week", value: "week" },
              { label: "All", value: "all" },
            ].map((range) => (
              <TouchableOpacity
                key={range.value}
                className={`px-3 py-2 m-1 rounded-xl ${presetRange === range.value ? "bg-primary" : "bg-gray-200"}`}
                onPress={() => setPresetRange(range.value)}
                disabled={!minDataDate || !maxDataDate || isNaN(minDataDate.getTime()) || isNaN(maxDataDate.getTime())}
              >
                <Text className={`font-rmedium ${presetRange === range.value ? "text-white" : "text-gray-700"}`}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {filterMode === "custom" && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-rmedium text-gray-700">Start Date:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-xl">
                <Text className="text-gray-800">{formatDateForDisplay(startDate)}</Text>
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate && !isNaN(startDate.getTime()) ? startDate : new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={minDataDate && !isNaN(minDataDate.getTime()) ? minDataDate : undefined}
                maximumDate={endDate && !isNaN(endDate.getTime()) ? endDate : undefined}
              />
            )}
            <View className="flex-row justify-between items-center">
              <Text className="font-rmedium text-gray-700">End Date:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="px-4 py-2 bg-gray-200 rounded-xl">
                <Text className="text-gray-800">{formatDateForDisplay(endDate)}</Text>
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate && !isNaN(endDate.getTime()) ? endDate : new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate && !isNaN(startDate.getTime()) ? startDate : undefined}
                maximumDate={maxDataDate && !isNaN(maxDataDate.getTime()) ? maxDataDate : undefined}
              />
            )}
          </View>
        )}
        <View className="bg-gray-200 p-2 rounded-xl mt-3">
          <Text className="text-center text-sm text-gray-600">
            {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
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
            <Text className="font-rmedium text-lg text-white">{type.charAt(0).toUpperCase() + type.slice(1)} Data</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="bg-white p-3 rounded-xl my-4 shadow-md">
        <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Data Summary</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="font-rmedium text-gray-600">Data Points</Text>
            <Text className="text-lg font-rbold text-orange-600">{processedChartData.totalPoints}</Text>
          </View>
          <View className="items-center">
            <Text className="font-rmedium text-gray-600">Duration</Text>
            <Text className="text-lg font-rbold text-orange-600">{getRangeDurationDisplay()}</Text>
          </View>
        </View>
      </View>

      {noDataForAllCriteria ? (
        <View className="bg-white p-4 rounded-xl my-4 items-center justify-center h-64 shadow-md">
          <Text className="text-lg font-rmedium text-red-500">No data available for selected city or date range.</Text>
        </View>
      ) : (
        <View>
          <View className="bg-white p-3 rounded-xl my-4 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Temperature (°C)</Text>
            <View style={styles.chartRowContainer}>
              <FixedYAxisLabels
                containerHeight={CHART_HEIGHT}
                paddingTop={CHART_TOP_PADDING}
                paddingBottom={CHART_X_AXIS_LABEL_AREA_HEIGHT}
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
          </View>
          <View className="bg-white p-3 rounded-xl my-4 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Rain (mm)</Text>
            <View style={styles.chartRowContainer}>
              <FixedYAxisLabels
                containerHeight={CHART_HEIGHT}
                paddingTop={CHART_TOP_PADDING}
                paddingBottom={CHART_X_AXIS_LABEL_AREA_HEIGHT}
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
          </View>
          <View className="bg-white p-3 rounded-xl mb-16 shadow-md">
            <Text className="text-center text-lg font-rbold mb-2 text-gray-700">Chance of Rain (%)</Text>
            <View style={styles.chartRowContainer}>
              <FixedYAxisLabels
                containerHeight={CHART_HEIGHT}
                paddingTop={CHART_TOP_PADDING}
                paddingBottom={CHART_X_AXIS_LABEL_AREA_HEIGHT}
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
          </View>
        </View>
      )}
      <View className="h-5" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chartRowContainer: { flexDirection: "row", marginTop: 8 },
  chartScrollView: { flex: 1 },
  yAxisLabelText: { textAlign: "right", paddingRight: 5 },
  tooltipContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipValue: { color: "white", fontSize: 15, fontWeight: "bold" },
  tooltipLabel: { color: "lightgray", fontSize: 12, marginTop: 3 },
  chartPlaceholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginVertical: 10,
    padding: 20,
  },
  chartPlaceholderText: { color: "#6c757d", fontSize: 15, textAlign: "center", lineHeight: 22 },
});

export default AnalyticsWidget;
