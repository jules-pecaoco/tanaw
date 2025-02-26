import Constants from "expo-constants";

const MAPBOX_PUBLIC_TOKEN = Constants?.expoConfig?.extra?.MAPBOX_PUBLIC_KEY;
const PROJECT_ID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;



export { MAPBOX_PUBLIC_TOKEN, PROJECT_ID };
