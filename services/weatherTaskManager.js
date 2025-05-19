import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { fetchOneCallWeather } from "@/services/openweather";

// Constants
const WEATHER_TASK_NAME = "background-weather-fetch";

// Define result constants in case BackgroundFetch.Result is undefined
const TASK_RESULT = {
  NewData: 1,
  NoData: 2,
  Failed: 3,
};

// Global state that persists between task executions
let latestLocation = null;
let notificationHandler = null;
let isTaskExecuting = false; // Add execution lock

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
    // Check if task is already executing
    if (isTaskExecuting) {
      console.log("Task already executing, skipping...");
      return BackgroundFetch.Result?.NoData || TASK_RESULT.NoData;
    }

    isTaskExecuting = true; // Set execution lock

    if (!latestLocation) {
      console.log("Location not available for weather fetch");
      isTaskExecuting = false; // Release lock
      return BackgroundFetch.Result?.NoData || TASK_RESULT.NoData;
    }

    if (!notificationHandler) {
      console.log("Notification handler not available");
      isTaskExecuting = false; // Release lock
      return BackgroundFetch.Result?.NoData || TASK_RESULT.NoData;
    }

    console.log("Executing background weather fetch with location:", `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}`);

    const weatherData = await fetchOneCallWeather({ currentLocation: latestLocation });
    await notificationHandler(weatherData);

    console.log("Background weather fetch completed successfully");
    isTaskExecuting = false; // Release lock
    return BackgroundFetch.Result?.NewData || TASK_RESULT.NewData;
  } catch (e) {
    console.error("Weather task error:", e);
    isTaskExecuting = false;
    return BackgroundFetch.Result?.Failed || TASK_RESULT.Failed;
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
    // Using a flag to prevent duplicate initial execution
    if (!isTaskExecuting && latestLocation && notificationHandler) {
      isTaskExecuting = true;
      console.log("Running initial weather fetch immediately...");
      try {
        const weatherData = await fetchOneCallWeather({ currentLocation: latestLocation });
        await notificationHandler(weatherData);
        console.log("Initial weather fetch completed successfully");
      } catch (error) {
        console.error("Error in initial weather fetch:", error);
      } finally {
        isTaskExecuting = false;
      }
    } else {
      console.log("Skipping initial weather fetch - task already executing or missing requirements");
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
