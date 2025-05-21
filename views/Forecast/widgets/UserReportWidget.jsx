import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native"; // Added StyleSheet
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const ALL_CITIES_VALUE = "ALL_CITIES";
const ALL_CITIES_LABEL = "All Cities";

const getDayKey = (date) => date.toISOString().split("T")[0];

// Constants from Code 2, adjusted for Code 1's context
const Y_AXIS_WIDTH = 40; // Adjusted from 50, can be tuned
const CHART_HEIGHT = 220; // From Code 2
const CHART_TOP_PADDING = 15; // From Code 2
const CHART_X_AXIS_SPACE = 40; // From Code 2 (space for X-axis labels)
const NO_OF_SECTIONS = 4; // For Y-axis divisions and chart rules

const yAxisTextStyleGlobal = { color: "gray", fontSize: 10 };
const xAxisLabelTextStyleGlobal = { color: "gray", fontSize: 10, height: CHART_X_AXIS_SPACE - 10, textAlign: "center" };

// FixedYAxisLabels Component (Copied from Code 2)
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

      // Ensure integer if step results in tiny decimal for integer values
      if (Number.isInteger(minValue) && Number.isInteger(maxValue) && Number.isInteger(step)) {
        val = Math.round(val);
      } else if (Number.isInteger(val)) {
        // keep it as integer
      } else {
        // For non-integer steps, or non-integer min/max, allow one decimal place
        const diff = Math.abs(maxValue - minValue);
        if (diff > 0 && diff < noOfSections * 2) {
          // Heuristic: if range is small, allow decimals
          val = parseFloat(val.toFixed(1));
        } else {
          val = Math.round(val); // Otherwise round to nearest integer
        }
      }
      generatedLabels.push(val);
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

const HazardAnalyticsWidget = ({ reports: initialReports, reportsIsLoading, reportsError }) => {
  const screenWidth = Dimensions.get("window").width - 40; // This is the card width

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

  const [dataProcessing, setDataProcessing] = useState(true); // For initial data processing

  useEffect(() => {
    setDataProcessing(true);
    const processedHazards = initialReports
      .map((hazard) => ({
        ...hazard,
        createdAtDate: new Date(hazard.created_at),
      }))
      .sort((a, b) => a.createdAtDate - b.createdAtDate);

    setAllHazards(processedHazards);

    const cities = [...new Set(processedHazards.map((h) => h.name.city))].filter(Boolean).sort(); // Filter out undefined/null cities
    setAvailableCities([{ label: ALL_CITIES_LABEL, value: ALL_CITIES_VALUE }, ...cities.map((city) => ({ label: city, value: city }))]);
    setSelectedCity(ALL_CITIES_VALUE);

    if (processedHazards.length > 0) {
      const firstDate = processedHazards[0].createdAtDate;
      const lastDate = processedHazards[processedHazards.length - 1].createdAtDate;
      setMinDataDate(new Date(firstDate));
      setMaxDataDate(new Date(lastDate));

      const thirtyDaysAgo = new Date(lastDate);
      thirtyDaysAgo.setDate(lastDate.getDate() - 29);

      setStartDate(thirtyDaysAgo < firstDate ? new Date(firstDate) : thirtyDaysAgo);
      setEndDate(new Date(lastDate));
    } else {
      const today = new Date();
      setMinDataDate(today);
      setMaxDataDate(today);
      setStartDate(today);
      setEndDate(today);
    }
    setDataProcessing(false);
  }, [initialReports]);

  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset") return;

    let newStart = new Date(minDataDate);
    let newEnd = new Date(maxDataDate);
    const todayInDataSetContext = new Date(maxDataDate); // Base preset calculations on the latest data point

    switch (presetRange) {
      case "today":
        newStart = new Date(todayInDataSetContext);
        newEnd = new Date(todayInDataSetContext);
        break;
      case "7days":
        newStart = new Date(todayInDataSetContext);
        newStart.setDate(todayInDataSetContext.getDate() - 6);
        newEnd = new Date(todayInDataSetContext);
        break;
      case "30days":
        newStart = new Date(todayInDataSetContext);
        newStart.setDate(todayInDataSetContext.getDate() - 29);
        newEnd = new Date(todayInDataSetContext);
        break;
      case "all":
        // newStart and newEnd are already min/maxDataDate
        break;
    }
    // Ensure startDate is not before minDataDate and endDate is not after maxDataDate
    setStartDate(newStart < minDataDate ? new Date(minDataDate) : newStart);
    setEndDate(newEnd > maxDataDate ? new Date(maxDataDate) : newEnd);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  const filteredAndAggregatedData = useMemo(() => {
    if (dataProcessing || !allHazards.length || !startDate || !endDate) {
      return { points: [], total: 0, maxReportValue: 0 };
    }

    const cityFiltered = selectedCity === ALL_CITIES_VALUE ? allHazards : allHazards.filter((h) => h.name.city === selectedCity);

    const dateFiltered = cityFiltered.filter((h) => {
      const hazardDate = h.createdAtDate;
      // Compare date parts only for filtering range
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999); // Include whole end day
      return hazardDate >= startDay && hazardDate <= endDay;
    });

    if (dateFiltered.length === 0) return { points: [], total: 0, maxReportValue: 0 };

    const aggregationMap = new Map();
    dateFiltered.forEach((hazard) => {
      const key = getDayKey(hazard.createdAtDate); // "YYYY-MM-DD"
      aggregationMap.set(key, (aggregationMap.get(key) || 0) + 1);
    });

    const sortedKeys = Array.from(aggregationMap.keys()).sort((a, b) => new Date(a) - new Date(b));

    const points = sortedKeys.map((key) => {
      const dateObj = new Date(key + "T00:00:00Z"); // Ensure UTC context for consistent MM-DD extraction
      const label = `${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(dateObj.getUTCDate()).padStart(2, "0")}`;
      return {
        value: aggregationMap.get(key),
        label: label, // For X-Axis and Tooltip
        date: key, // Full date "YYYY-MM-DD"
        dataPointColor: "#0ea5e9", // Color of the dot on the line
      };
    });

    const reportValues = points.map((p) => p.value);
    const actualMax = reportValues.length > 0 ? Math.max(0, ...reportValues) : 0;

    return { points, total: dateFiltered.length, maxReportValue: actualMax };
  }, [dataProcessing, allHazards, selectedCity, startDate, endDate]);

  // Destructure chart data and max value for rendering
  const { points: chartDataPoints, maxReportValue, total: totalReportsInView } = filteredAndAggregatedData;

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      // Ensure start date is not before minDataDate and not after current endDate
      const newStartDate = selectedDate < minDataDate ? new Date(minDataDate) : selectedDate;
      setStartDate(newStartDate > endDate ? new Date(endDate) : newStartDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // Ensure end date is not after maxDataDate and not before current startDate
      const newEndDate = selectedDate > maxDataDate ? new Date(maxDataDate) : selectedDate;
      setEndDate(newEndDate < startDate ? new Date(startDate) : newEndDate);
    }
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Common Pointer Configuration (from Code 2, adapted)
  const pointerConfig = useMemo(
    () => ({
      activatePointersOnLongPress: true,
      activatePointersDelay: 150,
      persistPointer: true,
      pointerVanishDelay: 3000,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 120, // Adjust as needed
      pointerLabelHeight: 60, // Adjust as needed
      pointerStripHeight: CHART_HEIGHT - CHART_TOP_PADDING - CHART_X_AXIS_SPACE,
      pointerStripColor: "lightgray",
      pointerStripWidth: 1,
      pointerColor: "dimgray", // Color of the vertical line/dot
      radius: 6, // Touch radius for pointer activation
      pointerLabelComponent: (items) => {
        if (!items || items.length === 0 || !items[0] || items[0].value === undefined) {
          return null;
        }
        const item = items[0];
        return (
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipValue}>
              {item.value} Report{item.value === 1 ? "" : "s"}
            </Text>
            {/* Assuming item.label is "MM-DD". If full date needed, use item.date */}
            {item.label && <Text style={styles.tooltipLabel}>Date: {item.label}</Text>}
          </View>
        );
      },
    }),
    [] // Dependencies empty as constants are used
  );

  if (reportsIsLoading || dataProcessing) {
    // Show loader if initial prop loading or internal processing
    return (
      <View className="flex-1 justify-center items-center bg-gray-200">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (reportsError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-200">
        <Text className="text-red-500 font-rbold text-center">Error: {reportsError}</Text>
        <Text className="text-gray-600 text-center mt-2">Could not load hazard reports. Please try again later.</Text>
      </View>
    );
  }

  const getRangeDurationDisplay = () => {
    if (!startDate || !endDate) return "0 days";
    // Ensure dates are valid before calculation
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "0 days";
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  // Chart specific calculations
  const scrollableChartContainerWidth = screenWidth - Y_AXIS_WIDTH; // screenWidth is card width
  const chartRenderWidth = Math.max(scrollableChartContainerWidth, chartDataPoints.length * 40); // Min width per point: 40

  const yAxisLabels_maxValue = maxReportValue;
  const lineChart_maxValue = maxReportValue === 0 ? NO_OF_SECTIONS : maxReportValue; // Chart needs some height if all 0

  return (
    <ScrollView showsVerticalScrollIndicator={false} className=" bg-gray-200 w-[100%] px-4">
      <View className="bg-white rounded-xl mb-4 shadow">
        {availableCities.length > 1 && ( // Only show picker if there's more than "All Cities" or actual cities
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
                disabled={!minDataDate || !maxDataDate} // Disable if date range not determined
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
                value={startDate || new Date()} // Ensure value is a Date object
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={minDataDate}
                maximumDate={endDate || maxDataDate} // Ensure max is valid
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
                value={endDate || new Date()} // Ensure value is a Date object
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate || minDataDate} // Ensure min is valid
                maximumDate={maxDataDate}
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
              paddingBottom={CHART_X_AXIS_SPACE}
              maxValue={yAxisLabels_maxValue}
              minValue={0}
              noOfSections={NO_OF_SECTIONS}
              yAxisSuffix="" // No suffix for counts
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
                startOpacity={0.8} // More opaque start for area
                endOpacity={0.1} // More transparent end
                color="#0ea5e9" // Line color
                // Y-Axis managed by FixedYAxisLabels, but chart needs scale & rules
                maxValue={lineChart_maxValue}
                minValue={0} // Assuming counts don't go negative
                noOfSections={NO_OF_SECTIONS} // For horizontal rules
                // Hide internal Y-axis visuals from gifted-chart
                hideYAxisText={true}
                yAxisThickness={0}
                yAxisColor="transparent"
                // X-Axis visuals
                xAxisThickness={0.5}
                xAxisColor="lightgray"
                xAxisLabelTextStyle={xAxisLabelTextStyleGlobal}
                xAxisLabelRotation={chartDataPoints.length > 10 ? 45 : 0}
                // Horizontal rules (grid lines)
                rulesType="solid"
                rulesColor="rgba(200,200,200,0.2)" // Light horizontal lines
                hideRules={false} // Show horizontal rules based on noOfSections
                // Spacing and Padding
                initialSpacing={chartDataPoints.length === 1 ? scrollableChartContainerWidth / 2 - 20 : 15}
                endSpacing={15} // Spacing at the end of the chart
                paddingTop={CHART_TOP_PADDING} // Padding above the chart line
                // spacing prop removed to let library auto-calculate based on width

                pointerConfig={pointerConfig} // Interactive tooltips
                isAnimated={true} // Can be true for smoother pointer
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
  chartRowContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  chartScrollView: {
    flex: 1, // Takes remaining width after FixedYAxisLabels
  },
  yAxisLabelText: {
    // Style for text within FixedYAxisLabels
    textAlign: "right",
    paddingRight: 5, // Space from the edge of Y_AXIS_WIDTH area
  },
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
  tooltipValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  tooltipLabel: {
    color: "lightgray",
    fontSize: 11,
    marginTop: 2,
  },
});

export default HazardAnalyticsWidget;
