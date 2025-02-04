import React from "react";

import { NotificationData } from "@/data/sampleData";
import { testicons } from "@/constants/index";
import NotificationScreen from "@/views/Notification/NotificationScreen";


const Notification = () => {
  NotificationData.map((data) => {
    data.icon = testicons.heatindex;
  });

  NotificationData.sort((a, b) => new Date(b.date) - new Date(a.date));
 
  return <NotificationScreen notificationData={NotificationData} />;
};

export default Notification;
