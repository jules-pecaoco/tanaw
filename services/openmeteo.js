import axios from "axios";

const OPENMETEO_API_URL = "https://api.open-meteo.com/v1/forecast";

const fetchWeatherData = async ({ queryKey }) => {
  const [, selectedCity, cities] = queryKey;
  const { lat, lon } = cities[selectedCity];

  const response = await axios.get(OPENMETEO_API_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: "rain,precipitation_probability,temperature_80m",
      daily: "rain_sum,precipitation_probability_max,temperature_2m_max",
      timezone: "auto",
      past_days: 7,
    },
  });

  const json = response.data;
  const hourly = json.hourly;
  const daily = json.daily;

  return {
    hourly: {
      time: hourly.time,
      rain: hourly.rain,
      precipitationProbability: hourly.precipitation_probability,
      temperature80m: hourly.temperature_80m,
    },
    daily: {
      time: daily.time,
      rain: daily.rain_sum,
      precipitationProbability: daily.precipitation_probability_max,
      temperature80m: hourly.temperature_80m,
    },
    initialSelectedDay: daily.time[0],
  };
};

export { fetchWeatherData };
