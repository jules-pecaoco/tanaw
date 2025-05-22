import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const ALL_CITIES_VALUE = "ALL_CITIES";
const ALL_CITIES_LABEL = "All Cities";

const getDayKey = (date) => date.toISOString().split("T")[0];

const Y_AXIS_WIDTH = 40;
const CHART_HEIGHT = 220;
const CHART_TOP_PADDING = 15;
const CHART_X_AXIS_LABEL_AREA_HEIGHT = 40;
const X_AXIS_SPACING_PER_ITEM = 40;
const DEFAULT_CHART_HORIZONTAL_PADDING = 15;
const NO_OF_SECTIONS = 4;

const yAxisTextStyleGlobal = { color: "gray", fontSize: 10 };
const xAxisLabelTextStyleGlobal = { color: "gray", fontSize: 10, height: CHART_X_AXIS_LABEL_AREA_HEIGHT - 10, textAlign: "center" };

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
      if (Number.isInteger(minValue) && Number.isInteger(maxValue) && Number.isInteger(step)) {
        val = Math.round(val);
      } else if (Number.isInteger(val)) {
        /* keep as integer */
      } else {
        const diff = Math.abs(maxValue - minValue);
        if (diff > 0 && diff < noOfSections * 2) val = parseFloat(val.toFixed(1));
        else val = Math.round(val);
      }
      generatedLabels.push(val);
    }
    return generatedLabels.reverse();
  }, [maxValue, minValue, noOfSections]);

  if (labels.length === 0) return <View style={{ width: Y_AXIS_WIDTH, height: containerHeight }} />;

  return (
    <View
      style={{ width: Y_AXIS_WIDTH, height: containerHeight, paddingTop: paddingTop, paddingBottom: paddingBottom, justifyContent: "space-between" }}
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

const HazardAnalyticsWidget = ({ reports: initialReports, reportsIsLoading, reportsError }) => {
  const screenWidth = Dimensions.get("window").width - 40;
  const [allHazards, setAllHazards] = useState([]);
  const [availableCities, setAvailableCities] = useState([{ label: ALL_CITIES_LABEL, value: ALL_CITIES_VALUE }]);
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES_VALUE);
  const [minDataDate, setMinDataDate] = useState(null);
  const [maxDataDate, setMaxDataDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filterMode, setFilterMode] = useState("preset");
  const [presetRange, setPresetRange] = useState("30days");
  const [dataProcessing, setDataProcessing] = useState(true);

  useEffect(() => {
    setDataProcessing(true);
    const processedHazards = initialReports
      .map((hazard) => ({ ...hazard, createdAtDate: new Date(hazard.created_at) }))
      .sort((a, b) => a.createdAtDate - b.createdAtDate);
    setAllHazards(processedHazards);
    const cities = [...new Set(processedHazards.map((h) => h.name.city))].filter(Boolean).sort();
    setAvailableCities([{ label: ALL_CITIES_LABEL, value: ALL_CITIES_VALUE }, ...cities.map((city) => ({ label: city, value: city }))]);
    setSelectedCity(ALL_CITIES_VALUE);

    if (processedHazards.length > 0) {
      const firstDate = new Date(processedHazards[0].createdAtDate);
      firstDate.setHours(0, 0, 0, 0);
      const lastDate = new Date(processedHazards[processedHazards.length - 1].createdAtDate);
      lastDate.setHours(0, 0, 0, 0);
      setMinDataDate(firstDate);
      setMaxDataDate(lastDate);
      let sDate = new Date(lastDate);
      sDate.setDate(lastDate.getDate() - 29); // Default to 30-day range ending on maxDataDate
      let eDate = new Date(lastDate);
      sDate = sDate < firstDate ? new Date(firstDate) : sDate; // Clamp to minDataDate
      setStartDate(sDate);
      setEndDate(eDate);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setMinDataDate(today);
      setMaxDataDate(today);
      setStartDate(today);
      setEndDate(today);
    }
    setDataProcessing(false);
  }, [initialReports]);

  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset" || isNaN(minDataDate.getTime()) || isNaN(maxDataDate.getTime())) return;

    let newStart = new Date(minDataDate);
    let newEnd = new Date(maxDataDate);
    const latestDataDay = new Date(maxDataDate);

    switch (presetRange) {
      case "today":
        newStart = new Date(latestDataDay);
        newEnd = new Date(latestDataDay);
        break;
      case "7days":
        newStart = new Date(latestDataDay);
        newStart.setDate(latestDataDay.getDate() - 6); // 7 days inclusive
        newEnd = new Date(latestDataDay);
        break;
      case "30days":
        newStart = new Date(latestDataDay);
        newStart.setDate(latestDataDay.getDate() - 29); // Corrected for a 30-day inclusive range
        newEnd = new Date(latestDataDay);
        break;
      case "all":
        // For "all", newStart and newEnd are already minDataDate and maxDataDate from initialization above
        break;
    }

    newStart.setHours(0, 0, 0, 0);
    newEnd.setHours(0, 0, 0, 0);

    let finalStartDate = newStart < minDataDate ? new Date(minDataDate) : newStart;
    finalStartDate = finalStartDate > maxDataDate ? new Date(maxDataDate) : finalStartDate;

    let finalEndDate = newEnd > maxDataDate ? new Date(maxDataDate) : newEnd;
    finalEndDate = finalEndDate < minDataDate ? new Date(minDataDate) : finalEndDate;

    if (finalStartDate > finalEndDate) {
      // Ensure start is not after end
      finalStartDate = new Date(finalEndDate);
    }

    setStartDate(finalStartDate);
    setEndDate(finalEndDate);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  const filteredAndAggregatedData = useMemo(() => {
    if (dataProcessing || !allHazards.length || !startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { points: [], total: 0, maxReportValue: 0 };
    }
    const cityFiltered = selectedCity === ALL_CITIES_VALUE ? allHazards : allHazards.filter((h) => h.name.city === selectedCity);
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

    const dateFiltered = cityFiltered.filter((h) => {
      const hazardDate = h.createdAtDate;
      // Filter by selected range, data will be empty if outside actual min/max data dates
      return hazardDate >= startDay && hazardDate <= endDay;
    });

    if (dateFiltered.length === 0) return { points: [], total: 0, maxReportValue: 0 };

    const aggregationMap = new Map();
    dateFiltered.forEach((hazard) => {
      const key = getDayKey(hazard.createdAtDate);
      aggregationMap.set(key, (aggregationMap.get(key) || 0) + 1);
    });

    const sortedKeys = Array.from(aggregationMap.keys()).sort((a, b) => new Date(a) - new Date(b));
    const points = sortedKeys.map((key) => {
      const dateObj = new Date(key + "T00:00:00Z"); // Use UTC to avoid timezone issues with getUTCMonth/Date
      const label = `${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(dateObj.getUTCDate()).padStart(2, "0")}`;
      return { value: aggregationMap.get(key), label: label, date: key, dataPointColor: "#0ea5e9" };
    });

    const reportValues = points.map((p) => p.value);
    const actualMax = reportValues.length > 0 ? Math.max(0, ...reportValues) : 0;
    return { points, total: dateFiltered.length, maxReportValue: actualMax };
  }, [dataProcessing, allHazards, selectedCity, startDate, endDate]);

  const { points: chartDataPoints, maxReportValue, total: totalReportsInView } = filteredAndAggregatedData;

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      let newStartDate = new Date(selectedDate);
      newStartDate.setHours(0, 0, 0, 0);
      if (endDate && !isNaN(endDate.getTime()) && newStartDate > endDate) {
        newStartDate = new Date(endDate); // Ensure start is not after end
      }
      setStartDate(newStartDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      let newEndDate = new Date(selectedDate);
      newEndDate.setHours(0, 0, 0, 0);
      if (startDate && !isNaN(startDate.getTime()) && newEndDate < startDate) {
        newEndDate = new Date(startDate); // Ensure end is not before start
      }
      setEndDate(newEndDate);
    }
  };

  const formatDateForDisplay = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
      radius: 6,
      pointerLabelComponent: (items) => {
        if (!items || items.length === 0 || !items[0] || items[0].value === undefined) return null;
        const item = items[0];
        return (
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipValue}>
              {item.value} Report{item.value === 1 ? "" : "s"}
            </Text>
            {item.label && <Text style={styles.tooltipLabel}>Date: {item.label}</Text>}
          </View>
        );
      },
    }),
    [CHART_HEIGHT, CHART_TOP_PADDING, CHART_X_AXIS_LABEL_AREA_HEIGHT]
  );

  if (reportsIsLoading || dataProcessing)
    return (
      <View className="flex-1 justify-center items-center bg-gray-200">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );

  if (reportsError)
    return (
      <View className="flex-1 justify-center items-center bg-gray-200">
        <Text className="text-red-500 font-rbold text-center">Error: {reportsError}</Text>
        <Text className="text-gray-600 text-center mt-2">Could not load hazard reports.</Text>
      </View>
    );

  const getRangeDurationDisplay = () => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "0 days";
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive days
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  const scrollableChartContainerWidth = screenWidth - Y_AXIS_WIDTH;
  const yAxisLabels_maxValue = maxReportValue;
  const lineChart_maxValue = maxReportValue === 0 ? NO_OF_SECTIONS : maxReportValue; // Ensure chart doesn't break if max is 0
  const numPoints = chartDataPoints.length;

  let chartRenderWidth,
    currentInitialSpacing = DEFAULT_CHART_HORIZONTAL_PADDING,
    currentEndSpacing = DEFAULT_CHART_HORIZONTAL_PADDING,
    pointSpacing = X_AXIS_SPACING_PER_ITEM;

  if (numPoints === 0) {
    chartRenderWidth = scrollableChartContainerWidth;
    currentInitialSpacing = 0;
    currentEndSpacing = 0;
    pointSpacing = 0;
  } else if (numPoints === 1) {
    chartRenderWidth = scrollableChartContainerWidth;
    currentInitialSpacing = Math.max(DEFAULT_CHART_HORIZONTAL_PADDING, (scrollableChartContainerWidth - X_AXIS_SPACING_PER_ITEM) / 2);
    currentEndSpacing = chartRenderWidth - currentInitialSpacing - X_AXIS_SPACING_PER_ITEM;
    currentEndSpacing = Math.max(DEFAULT_CHART_HORIZONTAL_PADDING, currentEndSpacing);
    chartRenderWidth = Math.max(scrollableChartContainerWidth, currentInitialSpacing + X_AXIS_SPACING_PER_ITEM + currentEndSpacing);
    pointSpacing = X_AXIS_SPACING_PER_ITEM;
  } else {
    const idealContentWidth = currentInitialSpacing + pointSpacing * (numPoints - 1) + currentEndSpacing;
    chartRenderWidth = Math.max(scrollableChartContainerWidth, idealContentWidth);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className=" bg-gray-200 w-[100%] px-4">
      <View className="bg-white rounded-xl mb-4 shadow">
        {availableCities.length > 1 && (
          <Picker selectedValue={selectedCity} onValueChange={(itemValue) => setSelectedCity(itemValue)} style={{ height: 50, width: "100%" }}>
            {availableCities.map((city) => (
              <Picker.Item key={city.value} label={city.label} value={city.value} />
            ))}
          </Picker>
        )}
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow">
        <Text className="text-center text-lg font-rmedium mb-3 text-black">Date Range</Text>
        <View className="flex-row justify-center mb-3">
          <TouchableOpacity
            className={`px-4 py-2 mx-1 rounded-xl ${filterMode === "preset" ? "bg-primary" : "bg-neutral-200"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-rmedium ${filterMode === "preset" ? "text-white" : "text-neutral-700"}`}>Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 mx-1 rounded-xl ${filterMode === "custom" ? "bg-primary" : "bg-neutral-200"}`}
            onPress={() => setFilterMode("custom")}
          >
            <Text className={`font-rmedium ${filterMode === "custom" ? "text-white" : "text-neutral-700"}`}>Custom</Text>
          </TouchableOpacity>
        </View>

        {filterMode === "preset" && (
          <View className="flex-row flex-wrap justify-center mb-2">
            {[
              { label: "Today", value: "today" },
              { label: "7 Days", value: "7days" },
              { label: "30 Days", value: "30days" },
              { label: "All", value: "all" },
            ].map((range) => (
              <TouchableOpacity
                key={range.value}
                className={`px-3 py-2 m-1 rounded-xl ${presetRange === range.value ? "bg-primary" : "bg-neutral-100"}`}
                onPress={() => setPresetRange(range.value)}
                disabled={!minDataDate || !maxDataDate}
              >
                <Text className={`font-rmedium ${presetRange === range.value ? "text-white" : "text-neutral-700"}`}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filterMode === "custom" && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-rmedium text-black">Start Date:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="px-3 py-2 bg-neutral-200 rounded-xl">
                <Text className="text-black">{formatDateForDisplay(startDate)}</Text>
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                maximumDate={endDate && !isNaN(endDate.getTime()) ? endDate : undefined}
                minimumDate={minDataDate && !isNaN(minDataDate.getTime()) ? minDataDate : undefined} // Added minimumDate constraint
              />
            )}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-rmedium text-black">End Date:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="px-3 py-2 bg-neutral-200 rounded-xl">
                <Text className="text-black">{formatDateForDisplay(endDate)}</Text>
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate && !isNaN(startDate.getTime()) ? startDate : undefined}
                maximumDate={maxDataDate && !isNaN(maxDataDate.getTime()) ? maxDataDate : undefined} // Added maximumDate constraint
              />
            )}
          </View>
        )}
        <View className="bg-neutral-100 p-2 rounded-xl mt-2">
          <Text className="text-center text-sm text-neutral-600">
            {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow">
        <Text className="text-center text-lg font-rmedium mb-3 text-black">Summary</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="font-rmedium text-black">Total Reports</Text>
            <Text className="text-xl font-rregular text-primary">{totalReportsInView}</Text>
          </View>
          <View className="items-center">
            <Text className="font-rmedium text-black">Duration</Text>
            <Text className="text-xl font-rregular text-primary">{getRangeDurationDisplay()}</Text>
          </View>
        </View>
      </View>

      {chartDataPoints.length === 0 ? (
        <View className="bg-white rounded-xl p-4 mb-4 shadow items-center justify-center h-64">
          <Text className="text-md font-rmedium text-red-500">No data for selected criteria.</Text>
        </View>
      ) : (
        <View className="bg-white rounded-xl p-4 mb-4 shadow">
          <Text className="text-center text-lg font-rmedium mb-3 text-black">Report Trends (Daily)</Text>
          <View style={styles.chartRowContainer}>
            <FixedYAxisLabels
              containerHeight={CHART_HEIGHT}
              paddingTop={CHART_TOP_PADDING}
              paddingBottom={CHART_X_AXIS_LABEL_AREA_HEIGHT}
              maxValue={yAxisLabels_maxValue}
              minValue={0}
              noOfSections={NO_OF_SECTIONS}
              yAxisSuffix=""
              textStyle={yAxisTextStyleGlobal}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollView}>
              <LineChart
                data={chartDataPoints}
                width={chartRenderWidth}
                height={CHART_HEIGHT}
                curved
                areaChart
                startFillColor={"rgba(14, 165, 233, 0.3)"}
                endFillColor={"rgba(14, 165, 233, 0.05)"}
                startOpacity={0.8}
                endOpacity={0.1}
                color="#0ea5e9"
                maxValue={lineChart_maxValue}
                minValue={0}
                noOfSections={NO_OF_SECTIONS}
                hideYAxisText={true}
                yAxisThickness={0}
                yAxisColor="transparent"
                xAxisThickness={0.5}
                xAxisColor="lightgray"
                xAxisLabelTextStyle={xAxisLabelTextStyleGlobal}
                xAxisLabelRotation={numPoints > chartRenderWidth / (X_AXIS_SPACING_PER_ITEM * 0.7) ? 45 : 0}
                rulesType="solid"
                rulesColor="rgba(200,200,200,0.2)"
                hideRules={false}
                spacing={pointSpacing}
                initialSpacing={currentInitialSpacing}
                endSpacing={currentEndSpacing}
                paddingTop={CHART_TOP_PADDING}
                pointerConfig={pointerConfig}
                isAnimated={true}
                animationDuration={150}
              />
            </ScrollView>
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tooltipValue: { color: "white", fontSize: 14, fontWeight: "bold" },
  tooltipLabel: { color: "lightgray", fontSize: 11, marginTop: 2 },
});

export default HazardAnalyticsWidget;
