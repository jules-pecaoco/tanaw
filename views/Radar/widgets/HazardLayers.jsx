import React from "react";
import { VectorSource, FillLayer } from "@rnmapbox/maps";


const HazardLayers = ({vectorID, vectorURL, fillLayerID, fillLayerSourceID, style}) => {
  return (
    <VectorSource id={vectorID} url={vectorURL}>
      <FillLayer
        id={fillLayerID}
        sourceLayerID={fillLayerSourceID}
        style={style}
      />
    </VectorSource>
  );
};

export default HazardLayers;
