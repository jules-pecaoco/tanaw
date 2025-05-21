import { View, Text, Image, ActivityIndicator } from "react-native";
import { React, useState, useEffect, useCallback } from "react"; 
import { useQuery } from "@tanstack/react-query";

// API Services
import { fetchOneCallWeather } from "@/services/openweather";
import useHazardReports from "@/hooks/useHazardReports";
import { fetchWeatherData } from "@/services/openmeteo";

// Components
import CustomButton from "@/views/components/CustomButton";
import ForecastWidget from "@/views/Forecast/widgets/ForecastWidget";
import AnalyticsWidget from "@/views/Forecast/widgets/AnalyticsWidget";
import UserReportWidget from "@/views/Forecast/widgets/UserReportWidget";
import useLocation from "@/hooks/useLocation";

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

const ForecastScreen = () => {
  const { location } = useLocation();
  const { reports, reportsIsLoading, reportsError } = useHazardReports();

  const [currentLocation, setCurrentLocation] = useState(() => {
    if (location) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return { latitude: 10.65709, longitude: 122.948 };
  });

  const [active, setActive] = useState("forecast");

  // ANALYTICS STATES
  const [selectedCity, setSelectedCity] = useState("Bacolod City");
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    data: userWeatherOneCall,
    isLoading: isLoadingUserWeatherOneCall,
    error: isErrorUserWeatherOneCall,
  } = useQuery({
    queryKey: ["userWeatherOneCall"],
    queryFn: () => fetchOneCallWeather({ currentLocation }),
    staleTime: 1000 * 60 * 60 * 3, //3 hours
    gcTime: 1000 * 60 * 60 * 6, //6 hours
  });

  useEffect(() => {
    const loadWeatherData = async () => {
      if (!selectedCity || !cities[selectedCity]) {
        setError("Selected city information is not available.");
        setIsLoading(false);
        setRawData(null); // Clear previous data
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const cityDetails = cities[selectedCity];
        const weatherData = await fetchWeatherData(selectedCity, cityDetails.lat, cityDetails.lon);
        setRawData(weatherData);
      } catch (err) {
        console.error("Parent: Error fetching weather data:", err);
        setError(err.message || "Failed to fetch weather data");
        setRawData(null); // Clear previous data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadWeatherData();
  }, [selectedCity]);

  const handleCityChange = useCallback((newCity) => {
    setSelectedCity(newCity);
  }, []);

  if (isLoadingUserWeatherOneCall) return <ActivityIndicator size="large" color="#FF8C00" className="flex-1" />;
  console.log("User Weather OneCall: ", userWeatherOneCall);

  return (
    <View className="flex-1 bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        {/* TOP */}
        <View className="flex flex-col items-center justify-between bg-white w-full p-4 gap-3">
          {/* DATA */}
          <View className="flex flex-row items-center justify-between w-full px-4">
            <View className="flex flex-col items-start justify-center gap-1 w-1/2">
              <Text className="text-4xl font-rregular">
                {userWeatherOneCall?.name?.locality ?? "Bacolod"}, {userWeatherOneCall?.name?.region ?? "Negros Occidental"}
              </Text>
              <Text className="text-sm font-rlight">Heat Index</Text>
              <Text className="text-7xl font-rregular">{Math.round(userWeatherOneCall?.current?.heat_index) ?? "-"}°C</Text>
            </View>
            <View className="flex flex-col items-end gap-1 w-1/2">
              {userWeatherOneCall?.current?.weather?.icon && (
                <Image
                  source={{
                    uri: userWeatherOneCall?.current?.weather?.icon,
                  }}
                  className="size-32"
                />
              )}
            </View>
          </View>

          {/* FILTERS */}
          <View className="flex flex-row items-center justify-between w-full px-4 self-end justify-self-end gap-2 ">
            <CustomButton
              title="Forecast"
              handlePress={() => setActive("forecast")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "forecast" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>

            <CustomButton
              title="Analytics"
              handlePress={() => setActive("analytics")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "analytics" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>
            <CustomButton
              title="User Report"
              handlePress={() => setActive("userreport")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "userreport" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>
          </View>
        </View>

        {/* FILTERS */}
        <>
          {active == "forecast" ? (
            <ForecastWidget data={{ userWeatherOneCall }} />
          ) : active == "analytics" ? (
            <AnalyticsWidget
              rawData={rawData}
              isLoading={isLoading}
              error={error}
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              cities={cities}
            />
          ) : active == "userreport" ? (
            <UserReportWidget reports={reports} loading={reportsIsLoading} error={reportsError} />
          ) : null}
        </>
      </View>
    </View>
  );
};

export default ForecastScreen;
