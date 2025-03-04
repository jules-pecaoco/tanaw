import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

const userStorage = {
  getItem: (key) => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: (key, value) => {
    storage.set(key, JSON.stringify(value));
  },
  removeItem: (key) => {
    storage.delete(key);
  },
  getAllKeys: () => {
    return storage.getAllKeys();
  },
};

export default userStorage;
