import { router } from "expo-router";
import { useEffect } from "react";

import { images } from "@/constants/index";
import { userPermissionStore } from "@/context/userPermissionStore";
import IndexScreen from "@/views/screens/IndexScreen";
import {IndexData} from "@/data/contentData";

export default function Index() {
  useEffect(() => {
    const checkPermissions = () => {
      const location = userPermissionStore.getItem("location");
      const expoPushToken = userPermissionStore.getItem("expoPushToken");

      console.log(location, expoPushToken);
      if (location || expoPushToken) {
        router.replace("/radar");
      }
    };

    setTimeout(checkPermissions, 0);
  }, []);

  const icon = images.tanawLogoWhite;

  return (
    <IndexScreen
      title={IndexData.title}
      titleDescription={IndexData.titleDescription}
      description={IndexData.description}
      textGuide={IndexData.textGuide}
      logo={icon}
      handlePress={() => router.push("/locationAccess")}
    />
  );
}
