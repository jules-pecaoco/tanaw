import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { PROJECT_ID } from "@/tokens/tokens";

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

// REQUEST PERMISSION TO SEND NOTIFICATION
const accessNotification = async () => {
  // SET NOTIFICATION CHANNEL FOR ANDROID
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // ONLY SEND NOTIFICATION IF DEVICE IS PHYSICAL
  if (Device.isDevice) {
    // CHECK IF PERMISSION IS GRANTED
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId = PROJECT_ID;

    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      // SET NOTIFICATION TOKEN
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
};

export default accessNotification;
