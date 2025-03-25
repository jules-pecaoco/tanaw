import React, { useState } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedRange, setSelectedRange] = useState("hourly");
  const [selectedCity, setSelectedCity] = useState("Bacolod City");
  const [selectedDay, setSelectedDay] = useState("");

  const { data, isLoading, error } = useQuery(["weatherData", selectedCity, cities], fetchWeatherData, {
    onSuccess: (data) => {
      if (!selectedDay && data.initialSelectedDay) {
        setSelectedDay(data.initialSelectedDay);
      }
    },
  });

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

  const filteredHourlyData =
    selectedRange === "hourly"
      ? {
          time: dataSource.time ? dataSource.time.filter((t) => t.startsWith(selectedDay)) : [],
          rain: dataSource.rain
            ? dataSource.rain.slice(
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)),
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)) + 24
              )
            : [],
          precipitationProbability: dataSource.precipitationProbability
            ? dataSource.precipitationProbability.slice(
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)),
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)) + 24
              )
            : [],
          temperature80m: dataSource.temperature80m
            ? dataSource.temperature80m.slice(
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)),
                dataSource.time.findIndex((t) => t.startsWith(selectedDay)) + 24
              )
            : [],
        }
      : dataSource;

  const chartDataTemperature = {
    labels: filteredHourlyData.time.map((t) => (selectedRange === "hourly" ? t.split("T")[1].slice(0, 5) : t.split("T")[0])),
    datasets: [{ data: filteredHourlyData.temperature80m || [] }],
  };

  const chartDataRain = {
    labels: filteredHourlyData.time.map((t) => (selectedRange === "hourly" ? t.split("T")[1].slice(0, 5) : t.split("T")[0])),
    datasets: [{ data: filteredHourlyData.rain || [] }],
  };

  const chartDataPrecipitation = {
    labels: filteredHourlyData.time.map((t) => (selectedRange === "hourly" ? t.split("T")[1].slice(0, 5) : t.split("T")[0])),
    datasets: [{ data: filteredHourlyData.precipitationProbability || [] }],
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 pt-12">
      <Text className="text-center text-2xl font-bold text-orange-600 mb-4">Data Visualization</Text>

      <Picker selectedValue={selectedCity} onValueChange={(itemValue) => setSelectedCity(itemValue)}>
        {Object.keys(cities).map((city) => (
          <Picker.Item key={city} label={city} value={city} />
        ))}
      </Picker>

      {selectedRange === "hourly" && (
        <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)}>
          {weatherData.daily.time.map((day) => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>
      )}

      <View className="flex-row justify-center mb-4">
        {["hourly", "daily"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 mx-2 rounded-lg ${selectedRange === type ? "bg-orange-500" : "bg-orange-200"}`}
            onPress={() => setSelectedRange(type)}
          >
            <Text className={`font-bold ${selectedRange === type ? "text-white" : "text-orange-800"}`}>
              {type === "hourly" ? "Hourly Data" : "Daily Data"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Temperature Chart */}
      <View className="bg-white p-3 rounded-xl my-4">
        <Text className="text-center text-lg font-bold mb-2">Temperature (°C)</Text>
        <ScrollView horizontal>
          <LineChart
            data={chartDataTemperature}
            width={screenWidth * 1.5}
            height={250}
            yAxisSuffix={"°C"}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#f5f5f5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: { rotation: -45 },
            }}
            bezier
            style={{ borderRadius: 10 }}
          />
        </ScrollView>
      </View>

      {/* Rainfall Chart */}
      <View className="bg-white p-3 rounded-xl my-4">
        <Text className="text-center text-lg font-bold mb-2">Rainfall (mm)</Text>
        <ScrollView horizontal>
          <LineChart
            data={chartDataRain}
            width={screenWidth * 1.5}
            height={250}
            yAxisSuffix="mm"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#f5f5f5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: { rotation: -45 },
            }}
            bezier
            style={{ borderRadius: 10 }}
          />
        </ScrollView>
      </View>

      {/* Precipitation Chart */}
      <View className="bg-white p-3 rounded-xl mb-16">
        <Text className="text-center text-lg font-bold mb-2">Precipitation Probability (%)</Text>
        <ScrollView horizontal>
          <LineChart
            data={chartDataPrecipitation}
            width={screenWidth * 1.5}
            height={250}
            yAxisSuffix="%"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#f5f5f5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: { rotation: -45 },
            }}
            bezier
            style={{ borderRadius: 10 }}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default AnalyticsWidget;
