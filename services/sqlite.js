import * as SQLite from "expo-sqlite";

let dbInstance = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("notifications");
  }
  return dbInstance;
};

const setupNotificationsTable = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT, 
      body TEXT, 
      timestamp TEXT
    );
  `);
};

const saveNotification = async (title, body, timeStamp) => {
  const db = await getDatabase();
  const result = await db.runAsync("INSERT INTO notifications (title, body, timestamp) VALUES (?, ?, ?)", [title, body, timeStamp]);

  return result.lastInsertRowId;
};

const fetchNotifications = async () => {
  const db = await getDatabase();
  return await db.getAllAsync("SELECT * FROM notifications ORDER BY timestamp DESC");
};

const clearAllNotifications = async () => {
  const db = await getDatabase();
  await db.execAsync("DELETE FROM notifications");
  return true;
};

export { setupNotificationsTable, saveNotification, fetchNotifications, clearAllNotifications };
