import { create } from "zustand";

export const useLocationStore = create((set) => ({
  location: null,
  setLocation: (location) => set({ location }),

  locationPermission: false,
  setLocationPermission: (locationPermission) => set({ locationPermission }),
}));
