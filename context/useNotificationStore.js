import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  expoPushToken: "",
  setExpoPushToken: (token) => set({ expoPushToken: token }),

  notification: undefined,
  setNotification: (notification) => set({ notification }),
}));
