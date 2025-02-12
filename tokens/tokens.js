import Constants from "expo-constants";

const MAPBOX_PUBLIC_TOKEN = "pk.eyJ1IjoianVsZXMtZGV2cyIsImEiOiJjbTZ6NGZnazIwMHhoMmtwenNvNXM5NXVxIn0.6opwvhdZlE5UZvjrrElbYQ";
const PROJECT_ID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;



export { MAPBOX_PUBLIC_TOKEN, PROJECT_ID };
