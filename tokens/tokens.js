import Constants from "expo-constants";

const PROJECT_ID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
const GOOGLE_PLACES_API_KEY = Constants?.expoConfig?.extra?.GOOGLE_PLACES_API_KEY;
const MAPBOX_PUBLIC_TOKEN = Constants?.expoConfig?.extra?.MAPBOX_PUBLIC_KEY;
const OPEN_WEATHER_API_KEY = Constants?.expoConfig?.extra?.OPEN_WEATHER_API_KEY;
const SUPABASE_URL = Constants?.expoConfig?.extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY;
const GEMINI_URL = Constants?.expoConfig?.extra?.GEMINI_URL;
const GEMINI_API_KEY = Constants?.expoConfig?.extra?.GEMINI_API_KEY;

export { MAPBOX_PUBLIC_TOKEN, PROJECT_ID, OPEN_WEATHER_API_KEY, GOOGLE_PLACES_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_URL, GEMINI_API_KEY };
