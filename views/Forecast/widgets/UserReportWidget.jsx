import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const ALL_CITIES_VALUE = "ALL_CITIES";
const ALL_CITIES_LABEL = "All Cities";

const getDayKey = (date) => date.toISOString().split("T")[0];

const HazardAnalyticsWidget = ({ reports: initialReports }) => {
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

  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [totalReportsInView, setTotalReportsInView] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const processedHazards = initialReports
      .map((hazard) => ({
        ...hazard,
        createdAtDate: new Date(hazard.created_at),
      }))
      .sort((a, b) => a.createdAtDate - b.createdAtDate);

    setAllHazards(processedHazards);

    const cities = [...new Set(processedHazards.map((h) => h.name.city))].sort();
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
    setIsLoading(false);
  }, [initialReports]);

  useEffect(() => {
    if (!minDataDate || !maxDataDate || filterMode !== "preset") return;

    let newStart = new Date(minDataDate);
    let newEnd = new Date(maxDataDate);
    const todayInDataSetContext = new Date(maxDataDate);

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
        break;
    }
    setStartDate(newStart < minDataDate ? new Date(minDataDate) : newStart);
    setEndDate(newEnd > maxDataDate ? new Date(maxDataDate) : newEnd);
  }, [presetRange, filterMode, minDataDate, maxDataDate]);

  const filteredAndAggregatedData = useMemo(() => {
    if (isLoading || !allHazards.length || !startDate || !endDate) {
      return { points: [], total: 0 };
    }

    const cityFiltered = selectedCity === ALL_CITIES_VALUE ? allHazards : allHazards.filter((h) => h.name.city === selectedCity);

    const dateFiltered = cityFiltered.filter((h) => {
      const hazardDate = h.createdAtDate;
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      return hazardDate >= startDay && hazardDate <= endDay;
    });

    setTotalReportsInView(dateFiltered.length);

    if (dateFiltered.length === 0) return { points: [], total: 0 };

    const aggregationMap = new Map();
    dateFiltered.forEach((hazard) => {
      const key = getDayKey(hazard.createdAtDate);
      aggregationMap.set(key, (aggregationMap.get(key) || 0) + 1);
    });

    const sortedKeys = Array.from(aggregationMap.keys()).sort((a, b) => new Date(a) - new Date(b));

    const points = sortedKeys.map((key) => {
      const dateObj = new Date(key + "T00:00:00Z");
      const label = `${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(dateObj.getUTCDate()).padStart(2, "0")}`;
      return {
        value: aggregationMap.get(key),
        label: label,
        date: key,
        labelTextStyle: { color: "gray", fontSize: 10 },
        dataPointColor: "#0ea5e9",
      };
    });
    return { points, total: dateFiltered.length };
  }, [isLoading, allHazards, selectedCity, startDate, endDate]);

  useEffect(() => {
    setChartDataPoints(filteredAndAggregatedData.points);
  }, [filteredAndAggregatedData]);

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate < minDataDate ? new Date(minDataDate) : selectedDate > endDate ? new Date(endDate) : new Date(selectedDate));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate > maxDataDate ? new Date(maxDataDate) : selectedDate < startDate ? new Date(startDate) : new Date(selectedDate));
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-200">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const getRangeDurationDisplay = () => {
    if (!startDate || !endDate) return "";
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-200 p-3">
      <View className="bg-white rounded-lg mb-4 shadow">
        {availableCities.length > 0 && (
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
            className={`px-4 py-2 mx-1 rounded-lg ${filterMode === "preset" ? "bg-primary" : "bg-neutral-200"}`}
            onPress={() => setFilterMode("preset")}
          >
            <Text className={`font-rmedium ${filterMode === "preset" ? "text-white" : "text-neutral-700"}`}>Preset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 mx-1 rounded-lg ${filterMode === "custom" ? "bg-primary" : "bg-neutral-200"}`}
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
                className={`px-3 py-2 m-1 rounded-lg ${presetRange === range.value ? "bg-primary" : "bg-neutral-100"}`}
                onPress={() => setPresetRange(range.value)}
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
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="px-3 py-2 bg-neutral-200 rounded-lg">
                <Text className="text-black">{formatDateForDisplay(startDate)}</Text>
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
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-rmedium text-black">End Date:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="px-3 py-2 bg-neutral-200 rounded-lg">
                <Text className="text-black">{formatDateForDisplay(endDate)}</Text>
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
        <View className="bg-neutral-100 p-2 rounded-lg mt-2">
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
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <LineChart
              data={chartDataPoints}
              width={chartDataPoints.length > 5 ? screenWidth * (chartDataPoints.length / 5) : screenWidth}
              height={250}
              yAxisLabelWidth={30}
              xAxisLabelRotation={chartDataPoints.length > 10 ? 45 : 0}
              curved
              areaChart
              hideRules
              startFillColor={"rgba(14, 165, 233, 0.3)"} // sky-500 with opacity (primary)
              endFillColor={"rgba(14, 165, 233, 0.05)"} // sky-500 with opacity (primary)
              startOpacity={0.9}
              endOpacity={0.2}
              color="#0ea5e9" // sky-500 (primary)
              noOfSections={Math.min(5, Math.max(...chartDataPoints.map((p) => p.value), 1))}
              spacing={
                chartDataPoints.length > 1 ? (screenWidth * (chartDataPoints.length / 5)) / chartDataPoints.length / (chartDataPoints.length / 5) : 50
              }
              initialSpacing={20}
              endSpacing={20}
              formatYLabel={(label) => {
                const num = Number(label);
                if (Number.isInteger(num)) return num.toString();
                return "";
              }}
              yAxisTextStyle={{ color: "gray" }} // text-black
              xAxisLabelTextStyle={{ color: "gray", fontSize: 10 }} // text-black
            />
          </ScrollView>
        </View>
      )}
      <View className="h-5" />
    </ScrollView>
  );
};

export default HazardAnalyticsWidget;
