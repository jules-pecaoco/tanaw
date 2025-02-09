import React from "react";
import { StatusBar } from "expo-status-bar";


import HazardFacilitiesWidget from "./widgets/HazardFacilitiesWidget";

const RadarScreen = () => {
  return (
    <>
      <HazardFacilitiesWidget></HazardFacilitiesWidget>
      <StatusBar hidden />
    </>
  );
};

export default RadarScreen;
