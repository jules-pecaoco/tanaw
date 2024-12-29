import { create } from 'zustand'

export const useUserPermissionStore = create((set) => ({
  location: null, // Default: no location
  setLocation: (location) => set({ location }),

  locationPermission: false, // Default: permission denied
  setLocationPermission: (locationPermission) => set({ locationPermission }),

  notificationPermission: false, // Default: permission denied
  setNotificationPermission: (notificationPermission) => set({ notificationPermission }),
}));
