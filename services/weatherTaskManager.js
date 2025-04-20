import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { fetchOneCallWeather } from "@/services/openweather";
import { sendNotificationIfNeeded } from "@/context/NotificationContext";

let latestLocation = null;

export const setUserLocationForTask = (loc) => {
  latestLocation = loc;
};

TaskManager.defineTask("background-weather-fetch", async () => {
  try {
    if (!latestLocation) {
      console.log("Location not available for weather fetch");
      return BackgroundFetch.Result.NoData;
    }

    const weatherData = await fetchOneCallWeather(latestLocation);
    await sendNotificationIfNeeded(weatherData);
    return BackgroundFetch.Result.NewData;
  } catch (e) {
    console.error("Weather task error:", e);
    return BackgroundFetch.Result.Failed;
  }
});

export const registerWeatherTask = async (location) => {
  setUserLocationForTask(location);

  await BackgroundFetch.registerTaskAsync("background-weather-fetch", {
    minimumInterval: 3600 * 6,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("✅ Weather background task registered with location");
};
