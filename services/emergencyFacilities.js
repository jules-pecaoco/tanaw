const fetchEmergencyFacilities = async (query = "hospital", longitude, latitude) => {
  const accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?proximity=${longitude},${latitude}&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.features; // Returns an array of places
  } catch (error) {
    console.error("Error fetching emergency facilities:", error);
    return [];
  }
};
  