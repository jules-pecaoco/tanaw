import { router } from "expo-router";
import { useEffect, useState } from "react";

import { images } from "@/constants/index";
import { IndexData } from "@/data/textContent";
import userPermissionStore from "@/storage/userPermissionStore";
import IndexScreen from "@/views/IndexScreen";

const Index = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkVisitedStatus = () => {
      const hasVisitedPermissionScreen = userPermissionStore.getItem("hasVisitedPermissionScreen");

      if (hasVisitedPermissionScreen) {
        setTimeout(() => {
          setIsReady(true);
          router.replace("/radar");
        }, 0);
      }
    };

    checkVisitedStatus();
  }, []);

  // If the user has visited the permission screen, then we don't need to show the index screen
  if (!isReady && userPermissionStore.getItem("hasVisitedPermissionScreen")) {
    return null;
  }

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
};

export default Index;
