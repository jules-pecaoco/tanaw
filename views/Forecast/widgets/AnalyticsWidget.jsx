import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
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
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const weatherData = await fetchWeatherData(selectedCity);
        setData(weatherData);

        if (!selectedDay && weatherData.initialSelectedDay) {
          setSelectedDay(weatherData.initialSelectedDay);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

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

  // Convert data for Gifted Charts
  const formatDataForChart = (data, color) =>
    data.map((value, index) => ({
      value,
      label: filteredHourlyData.time[index]
        ? selectedRange === "hourly"
          ? filteredHourlyData.time[index].split("T")[1].slice(0, 5)
          : filteredHourlyData.time[index].split("T")[0]
        : "",
      labelTextStyle: { color: "gray", fontSize: 10 },
      dataPointColor: color,
    }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-100 px-4 pt-12">
      <Picker selectedValue={selectedCity} onValueChange={(itemValue) => setSelectedCity(itemValue)} className="font-fmedium text-lg">
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
            className={`px-4 py-2 mx-2 rounded-lg ${selectedRange === type ? "bg-primary" : "bg-secondary"}`}
            onPress={() => setSelectedRange(type)}
          >
            <Text className={`font-rmedium text-lg ${selectedRange === type ? "text-white" : "text-white"}`}>
              {type === "hourly" ? "Hourly Data" : "Daily Data"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Temperature Chart */}
      <View className="bg-white p-3 rounded-xl my-4">
        <Text className="text-center text-lg font-rmedium mb-2">Temperature (°C) Trends</Text>
        <ScrollView horizontal>
          <LineChart
            data={formatDataForChart(filteredHourlyData.temperature80m || [], "#FF8C00")}
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
            data={formatDataForChart(filteredHourlyData.rain || [], "#0096FF")}
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
            data={formatDataForChart(filteredHourlyData.precipitationProbability || [], "#0096FF")}
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
    </ScrollView>
  );
};

export default AnalyticsWidget;
