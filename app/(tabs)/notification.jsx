import React from "react";

import NotificationScreen from "@/views/screens/Notification/NotificationScreen";
import { NotificationData } from "@/data/sampleData";
import { testicons } from "@/constants/index";

const Notification = () => {
  NotificationData.map((data) => {
    data.icon = testicons.heatindex;
  });

  NotificationData.sort((a, b) => new Date(b.date) - new Date(a.date));
 

  return <NotificationScreen notificationData={NotificationData} />;
};

export default Notification;
