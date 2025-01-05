// import { create } from "zustand";

// export const userPermissionStore = create((set) => ({
//   location: null,
//   setLocation: (location) => set({ location }),

//   expoPushToken: null,
//   setExpoPushToken: (expoPushToken) => set({ expoPushToken }),

//   notification: null,
//   setNotification: (notification) => set({ notification }),
// }));

import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const userPermissionStore = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

// how to access this
// import { userPermissionStore } from "@/context/userPermissionStore";


