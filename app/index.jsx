import { router } from "expo-router";
import { useEffect, useState } from "react";

import { images } from "@/constants/index";
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

  if (loading) return null;

  const IndexText = {
    title: "WELCOME",
    titleDescription: "On top of the risks, so you don’t have to be!",
    description:
      "Welcome to Tanaw, your essential tool for monitoring heat index levels and flood risks in your area. Be prepared, stay informed, and protect your community.",
    textGuide: "Start you setup in 2 easy steps",
  };

  return (
    hasVisited && (
      <IndexScreen
        title={IndexText.title}
        titleDescription={IndexText.titleDescription}
        description={IndexText.description}
        textGuide={IndexText.textGuide}
        logo={icon}
        handlePress={nextScreen}
      />
    )
  );
};

export default Index;
