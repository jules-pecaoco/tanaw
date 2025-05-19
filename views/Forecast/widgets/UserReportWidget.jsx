import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchHazardReports } from "@/services/supabase";

const screenWidth = Dimensions.get("window").width;

const UserReportWidget = () => {
  // State variables
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [hazardType, setHazardType] = useState("all");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); 
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all, active, inactive

  // Analytics data
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [hazardTypeCounts, setHazardTypeCounts] = useState([]);
  const [activeStatusData, setActiveStatusData] = useState([]);
  const [totalReports, setTotalReports] = useState(0);

  // Available hazard types (could be fetched from backend)
  const hazardTypes = [
    { label: "All Types", value: "all" },
    { label: "Flood", value: "flood" },
    { label: "Fire", value: "fire" },
    { label: "Earthquake", value: "earthquake" },
    { label: "Landslide", value: "landslide" },
    { label: "Road Damage", value: "road_damage" },
    { label: "Power Outage", value: "power_outage" },
    { label: "Other", value: "other" },
  ];

  // Load reports data
  useEffect(() => {
    loadReports();
  }, [hazardType, startDate, endDate, activeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Convert dates to ISO strings for the API call
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Build filters object
      const filters = {
        startDate: startDateStr,
        endDate: endDateStr,
      };

      if (hazardType !== "all") {
        filters.hazardType = hazardType;
      }

      if (activeFilter !== "all") {
        filters.active = activeFilter === "active";
      }

      const data = await fetchHazardReports(filters);
      setReports(data);
      processAnalyticsData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Failed to load reports. Please try again.");
      setLoading(false);
    }
  };

  // Process raw data into analytics formats
  const processAnalyticsData = (data) => {
    setTotalReports(data.length);

    // Process time series data (reports per day)
    const timeData = processTimeSeriesData(data);
    setTimeSeriesData(timeData);

    // Count by hazard type
    const typeCounts = processHazardTypeCounts(data);
    setHazardTypeCounts(typeCounts);

    // Count by active status
    const statusData = processActiveStatusData(data);
    setActiveStatusData(statusData);
  };

  // Group reports by day for the line chart
  const processTimeSeriesData = (data) => {
    const reportsByDay = {};

    data.forEach((report) => {
      const date = new Date(report.created_at);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!reportsByDay[dateKey]) {
        reportsByDay[dateKey] = 0;
      }
      reportsByDay[dateKey]++;
    });

    // Convert to chart format and sort by date
    return Object.entries(reportsByDay)
      .map(([date, count]) => ({
        date,
        value: count,
        label: date.substring(5), // MM-DD format
        dataPointText: count.toString(),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Count reports by hazard type for the pie chart
  const processHazardTypeCounts = (data) => {
    const counts = {};

    data.forEach((report) => {
      const type = report.hazard_type || "unknown";
      if (!counts[type]) {
        counts[type] = 0;
      }
      counts[type]++;
    });

    // Convert to pie chart format
    const colors = ["#FF7F50", "#6495ED", "#9ACD32", "#FFD700", "#8A2BE2", "#FF69B4", "#20B2AA", "#D2691E"];

    return Object.entries(counts).map(([type, count], index) => ({
      value: count,
      text: `${count}`,
      label: type,
      color: colors[index % colors.length],
      focused: false,
    }));
  };

  // Count reports by active status
  const processActiveStatusData = (data) => {
    let activeCount = 0;
    let inactiveCount = 0;

    data.forEach((report) => {
      if (report.active) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    return [
      { value: activeCount, text: activeCount.toString(), label: "Active", color: "#FF7F50", focused: false },
      { value: inactiveCount, text: inactiveCount.toString(), label: "Inactive", color: "#6495ED", focused: false },
    ];
  };

  // Date picker handlers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <ScrollView className="flex-1 bg-gray-100  mx-2 p-2" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold mb-4 text-gray-800">Hazard Reports Analytics</Text>

      {/* Filter Section */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow">
        <Text className="text-lg font-semibold mb-3 text-gray-800">Filters</Text>

        {/* Hazard Type Filter */}
        <View className="flex-row items-center mb-3">
          <Text className="w-24 text-base text-gray-600">Hazard Type:</Text>
          <View className="flex-1 border border-gray-300 rounded overflow-hidden">
            <Picker selectedValue={hazardType} onValueChange={setHazardType} className="h-10 w-full">
              {hazardTypes.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date Range Filters */}
        <View className="flex-row items-center mb-3">
          <Text className="w-24 text-base text-gray-600">Date Range:</Text>
          <View className="flex-1 flex-row items-center">
            <TouchableOpacity className="border border-gray-300 rounded p-2 bg-gray-50" onPress={() => setShowStartDatePicker(true)}>
              <Text>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            <Text className="mx-2"> to </Text>
            <TouchableOpacity className="border border-gray-300 rounded p-2 bg-gray-50" onPress={() => setShowEndDatePicker(true)}>
              <Text>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

      
      </View>

      {/* Date Pickers (hidden by default) */}
      {showStartDatePicker && <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartDateChange} />}
      {showEndDatePicker && <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndDateChange} />}

      {/* Analytics Content */}
      {loading ? (
        <View className="items-center justify-center p-5">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2">Loading reports data...</Text>
        </View>
      ) : error ? (
        <View className="items-center justify-center p-5">
          <Text className="text-red-500 mb-2">{error}</Text>
          <TouchableOpacity className="bg-primary py-2 px-5 rounded" onPress={loadReports}>
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-2">
          {/* Summary Stats */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-white rounded-lg p-4 items-center mx-1 shadow">
              <Text className="text-2xl font-bold text-primary">{totalReports}</Text>
              <Text className="text-xs text-gray-500 mt-1">Total Reports</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 items-center mx-1 shadow">
              <Text className="text-2xl font-bold text-primary">{hazardTypeCounts.length > 0 ? hazardTypeCounts.length : 0}</Text>
              <Text className="text-xs text-gray-500 mt-1">Hazard Types</Text>
            </View>
          </View>

          {/* Time Series Chart */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow">
            <Text className="text-base font-semibold mb-3 text-gray-800">Reports Over Time</Text>
            {timeSeriesData.length > 0 ? (
              <LineChart
                data={timeSeriesData}
                width={screenWidth - 40}
                height={220}
                spacing={40}
                color="#0077CC"
                thickness={3}
                dataPointsColor="#0077CC"
                dataPointsRadius={4}
                showVerticalLines
                verticalLinesColor="rgba(0, 0, 0, 0.1)"
                noOfSections={5}
                yAxisLabelWidth={40}
                yAxisTextStyle={{ color: "#333" }}
                xAxisLabelTextStyle={{ color: "#333" }}
                hideDataPoints={timeSeriesData.length > 15}
                hideRules
                adjustToWidth
                rulesColor="rgba(0, 0, 0, 0.1)"
                rulesType="solid"
                initialSpacing={10}
                endSpacing={10}
                yAxisThickness={1}
                xAxisThickness={1}
                pointerConfig={{
                  pointerStripHeight: 140,
                  pointerStripColor: "rgba(0, 0, 0, 0.1)",
                  pointerStripWidth: 2,
                  pointerColor: "#0077CC",
                  radius: 6,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 30,
                  pointerLabelComponent: (item) => (
                    <View className="bg-white rounded shadow p-2 w-24 items-center">
                      <Text className="text-xs text-gray-600">{item.date}</Text>
                      <Text className="text-sm font-bold text-primary">{item.value} reports</Text>
                    </View>
                  ),
                }}
              />
            ) : (
              <View className="h-52 justify-center items-center">
                <Text className="text-gray-500 text-base">No time series data available</Text>
              </View>
            )}
          </View>

          {/* Hazard Type Distribution */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow">
            <Text className="text-base font-semibold mb-3 text-gray-800">Hazard Type Distribution</Text>
            {hazardTypeCounts.length > 0 ? (
              <View className="items-center my-2">
                <PieChart
                  data={hazardTypeCounts}
                  donut
                  radius={90}
                  showText
                  textSize={12}
                  showTextBackground
                  textBackgroundRadius={12}
                  textColor="#000"
                  labelsPosition="outward"
                  showLabels
                  showGradient={false}
                />
                <View className="flex-row flex-wrap justify-center mt-5">
                  {hazardTypeCounts.map((item, index) => (
                    <View key={index} className="flex-row items-center mr-4 mb-2">
                      <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-1" />
                      <Text className="text-xs text-gray-600">
                        {item.label} ({item.value})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="h-52 justify-center items-center">
                <Text className="text-gray-500 text-base">No hazard type data available</Text>
              </View>
            )}
          </View>

        </View>
      )}
    </ScrollView>
  );
};

export default UserReportWidget;
