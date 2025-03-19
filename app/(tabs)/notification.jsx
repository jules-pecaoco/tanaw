import React from "react";

import { NotificationData } from "@/data/sampleData";
import NotificationScreen from "@/views/Notification/NotificationScreen";
import { SafeAreaView } from "react-native";
import { SafeViewAndroid } from "@/constants/styles";

const Notification = () => {
  NotificationData.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <SafeAreaView className="flex-1">
      <NotificationScreen notificationData={NotificationData} />
    </SafeAreaView>
  );
};

export default Notification;
