import { useState, useEffect, useCallback } from "react";
import uuid from "react-native-uuid";

import storage from "@/storage/storage";

const UUID_STORAGE_KEY = "userUUID";

const useUserIdentifier = () => {
  const getInitialUUID = () => {
    const storedUUID = storage.getItem(UUID_STORAGE_KEY);
    if (storedUUID) {
      return storedUUID;
    }
    return null;
  };

  const [uniqueIdentifier, setUniqueIdentifier] = useState(getInitialUUID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUUIDFromStorage = useCallback(async () => {
    try {
      const storedUUID = storage.getItem(UUID_STORAGE_KEY);
      if (storedUUID) {
        setUniqueIdentifier(storedUUID);
      } else {
        const newUUID = uuid.v4();
        storage.setItem(UUID_STORAGE_KEY, newUUID);
        setUniqueIdentifier(newUUID);
        console.log("Generated new UUID:", newUUID);
      }
    } catch (error) {
      console.error("Error getting UUID from storage:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUUIDFromStorage();
  }, [getUUIDFromStorage]);

  return { uniqueIdentifier, loading, error };
};

export default useUserIdentifier;
