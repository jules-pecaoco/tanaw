import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { fetchOneCallWeather } from "@/services/openweather";

// Constants
const WEATHER_TASK_NAME = "background-weather-fetch";

// Global state that persists between task executions
let latestLocation = null;
let notificationHandler = null;

// Function to set location for background tasks
const setUserLocationForTask = (loc) => {
  latestLocation = loc;
};

// Function to set notification handler for background tasks
const setNotificationHandlerForTask = (handler) => {
  notificationHandler = handler;
};

// Define the background task
TaskManager.defineTask(WEATHER_TASK_NAME, async () => {
  try {
    if (!latestLocation) {
      console.log("Location not available for weather fetch");
      return BackgroundFetch.Result.NoData;
    }

    if (!notificationHandler) {
      console.log("Notification handler not available");
      return BackgroundFetch.Result.NoData;
    }

    console.log("Executing background weather fetch with location:", `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`);

    const weatherData = await fetchOneCallWeather({ currentLocation: latestLocation });
    await notificationHandler(weatherData);

    console.log("Background weather fetch completed successfully");
    return BackgroundFetch.Result.NewData;
  } catch (e) {
    console.error("Weather task error:", e);
    return BackgroundFetch.Result.Failed;
  }
});

// Check if the task is registered
const isWeatherTaskRegistered = async () => {
  try {
    const tasks = await TaskManager.getRegisteredTasksAsync();
    const isRegistered = tasks.some((task) => task.taskName === WEATHER_TASK_NAME);
    console.log(`Weather task registered: ${isRegistered}`);
    return isRegistered;
  } catch (error) {
    console.error("Error checking task registration:", error);
    return false;
  }
};

const registerWeatherTask = async (location, notificationCallback) => {
  console.log("Registering weather task with location:", location);
  try {
    // Set the global state
    setUserLocationForTask(location);
    setNotificationHandlerForTask(notificationCallback);

    console.log("Register Latest Location:", latestLocation);

    const taskRegistered = await isWeatherTaskRegistered();

    if (taskRegistered) {
      console.log("Weather task already registered, updating location data only");
    } else {
      await BackgroundFetch.registerTaskAsync(WEATHER_TASK_NAME, {
        minimumInterval: 1000 * 60 * 60 * 3, // 3 hours
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Weather background task registered successfully");
    }

    // Execute the task immediately after registration
    console.log("Running initial weather fetch immediately...");
    if (latestLocation && notificationHandler) {
      const weatherData = await fetchOneCallWeather({ currentLocation: latestLocation });
      await notificationHandler(weatherData);
      console.log("Initial weather fetch completed successfully");
    } else {
      console.log("Missing location or notification handler for initial weather fetch");
    }

    return true;
  } catch (error) {
    console.error("Error registering weather task:", error);
    return false;
  }
};

// Unregister the weather task
const unregisterWeatherTask = async () => {
  try {
    const isRegistered = await isWeatherTaskRegistered();

    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(WEATHER_TASK_NAME);
      console.log("Weather background task unregistered successfully");
      return true;
    } else {
      console.log("No weather task registered to unregister");
      return false;
    }
  } catch (error) {
    console.error("Error unregistering weather task:", error);
    return false;
  }
};

export { registerWeatherTask, unregisterWeatherTask, setUserLocationForTask, isWeatherTaskRegistered };
