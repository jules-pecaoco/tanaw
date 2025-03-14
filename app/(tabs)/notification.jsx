import React from "react";

import { NotificationData } from "@/data/sampleData";
import { testicons } from "@/constants/index";
import NotificationScreen from "@/views/Notification/NotificationScreen";
import { SafeAreaView } from "react-native";
import { SafeViewAndroid } from "@/constants/styles";

const Notification = () => {
  NotificationData.map((data) => {
    data.icon = testicons.heatindex;
  });

  NotificationData.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <SafeAreaView className="flex-1">
      <NotificationScreen notificationData={NotificationData} />
    </SafeAreaView>
  );
};

export default Notification;
