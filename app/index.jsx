import { router } from "expo-router";
import { useEffect } from "react";

import { images } from "@/constants/index";
import { IndexData } from "@/data/textContent";
import { useQuery } from "@tanstack/react-query";
import IndexScreen from "@/views/IndexScreen";
import userStorage from "@/storage/userStorage";

const Index = () => {
  const { data: hasVisited, isLoading } = useQuery({
    queryKey: ["hasVisited"],
    queryFn: () => {
      const visited = userStorage.getItem("hasVisited");
      return visited === "true";
    },
  });

  const nextScreen = () => {
    router.push("/locationAccess");
    // userStorage.setItem("hasVisited", "true");
  };

  useEffect(() => {
    if (hasVisited) {
      router.push("/radar");
    }
  }, [hasVisited]);

  const icon = images.tanawLogoWhite;

  if (hasVisited) {
    return null;
  }

  return (
    <IndexScreen
      title={IndexData.title}
      titleDescription={IndexData.titleDescription}
      description={IndexData.description}
      textGuide={IndexData.textGuide}
      logo={icon}
      handlePress={() => nextScreen()}
    />
  );
};

export default Index;
