import React from "react";

import { NotificationData } from "@/data/sampleData";
import NotificationScreen from "@/views/Notification/NotificationScreen";
import { SafeAreaView } from "react-native";

const Notification = () => {

  return (
    <SafeAreaView className="flex-1">
      <NotificationScreen  />
    </SafeAreaView>
  );
};

export default Notification;
