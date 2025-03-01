import React from "react";
import { VectorSource, FillLayer } from "@rnmapbox/maps";


// VectorSource is used to render vector data on the map | Vector Source is the mbtiles || geojson || shapefile uploaded to MapBox
// FillLayer is used to render a filled polygon on the map | Fill Layer is the Layers existing when uploading a source 

// url is the source of the vector data 
// sourceLayerID is the layer name of the source

const HazardLayers = React.memo(({ vectorID, vectorURL, fillLayerID, fillLayerSourceID, style }) => {
  return (
    <VectorSource id={vectorID} url={vectorURL}>
      <FillLayer id={fillLayerID} sourceLayerID={fillLayerSourceID} style={style} />
    </VectorSource>
  );
});

export default HazardLayers;
