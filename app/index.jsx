import { router } from "expo-router";
import { useEffect, useState } from "react";

import { images } from "@/constants/index";
import { IndexData } from "@/data/textContent";
import IndexScreen from "@/views/IndexScreen";
import storage from "@/storage/storage";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const checkVisited = () => {
      const visited = storage.getItem("hasVisited");
      if (visited) {
        router.push("/radar");
      } else {
        setHasVisited(true);
      }
      setLoading(false);
    };

    setTimeout(checkVisited, 100);
  }, []);

  const nextScreen = () => {
    storage.setItem("hasVisited", "true");
    router.push("/locationAccess");
  };

  const icon = images.tanawLogoWhite;

  if (loading) return null; // Ensure nothing renders until loading is complete

  return (
    hasVisited && (
      <IndexScreen
        title={IndexData.title}
        titleDescription={IndexData.titleDescription}
        description={IndexData.description}
        textGuide={IndexData.textGuide}
        logo={icon}
        handlePress={nextScreen}
      />
    )
  );
};

export default Index;
