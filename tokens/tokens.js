import Constants from "expo-constants";

const TOMORROWIO_API_KEY = Constants?.expoConfig?.extra?.TOMORROWIO_API_KEY;
const MAPBOX_PUBLIC_TOKEN = Constants?.expoConfig?.extra?.MAPBOX_PUBLIC_KEY;
const PROJECT_ID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
const OPEN_WEATHER_API_KEY = Constants?.expoConfig?.extra?.OPEN_WEATHER_API_KEY;



export { MAPBOX_PUBLIC_TOKEN, PROJECT_ID, OPEN_WEATHER_API_KEY, TOMORROWIO_API_KEY };
