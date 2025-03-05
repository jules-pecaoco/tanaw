import { MMKV } from "react-native-mmkv";
const storage = new MMKV();

export const userStorage = {
  getItem: (key) => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: (key, value) => {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing key ${key}:`, error);
    }
  },
  removeItem: (key) => {
    storage.delete(key);
  },
  getAllKeys: () => {
    return storage.getAllKeys();
  },
};

export const mmkvStorage = storage;

export default userStorage;
