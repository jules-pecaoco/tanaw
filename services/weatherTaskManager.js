import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { fetchOneCallWeather } from "@/services/openweather";
import { useNotification } from "@/context/NotificationContext";

let latestLocation = null;

const setUserLocationForTask = (loc) => {
  latestLocation = loc;
};

TaskManager.defineTask("background-weather-fetch", async () => {
  const { sendNotificationIfNeeded } = useNotification();
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

const registerWeatherTask = async (location) => {
  const { sendNotificationIfNeeded } = useNotification();

  setUserLocationForTask(location);

  // Register the background task
  await BackgroundFetch.registerTaskAsync("background-weather-fetch", {
    minimumInterval: 3600 * 6, // 6 hours
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("Weather background task registered with location");

  // Execute the task immediately after registration
  try {
    console.log("Running initial weather fetch immediately...");
    if (latestLocation) {
      const weatherData = await fetchOneCallWeather(latestLocation);
      await sendNotificationIfNeeded(weatherData);
      console.log("Initial weather fetch completed successfully");
    } else {
      console.log("Location not available for initial weather fetch");
    }
  } catch (error) {
    console.error("Error during initial weather fetch:", error);
  }
};

export { registerWeatherTask, setUserLocationForTask };
