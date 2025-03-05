import Constants from "expo-constants";

const PROJECT_ID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
const GOOGLE_PLACES_API_KEY = Constants?.expoConfig?.extra?.GOOGLE_PLACES_API_KEY;
const MAPBOX_PUBLIC_TOKEN = Constants?.expoConfig?.extra?.MAPBOX_PUBLIC_KEY;
const OPEN_WEATHER_API_KEY = Constants?.expoConfig?.extra?.OPEN_WEATHER_API_KEY;

export { MAPBOX_PUBLIC_TOKEN, PROJECT_ID, OPEN_WEATHER_API_KEY, GOOGLE_PLACES_API_KEY };
