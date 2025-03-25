import axios from "axios";

const OPENMETEO_API_URL = "https://api.open-meteo.com/v1/forecast";

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

const fetchWeatherData = async (selectedCity) => {
  const selected = selectedCity;
  const { lat, lon } = cities[selected];

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
