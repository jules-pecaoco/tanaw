import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

export function useNotificationSetup() {
  const { setExpoPushToken, setNotification } = userPermissionStore();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [setExpoPushToken, setNotification]);
}
