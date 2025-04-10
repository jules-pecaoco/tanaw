import * as SQLite from "expo-sqlite";

const getDatabase = async () => {
  return await SQLite.openDatabaseAsync("notifications");
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

const saveNotification = async (title, body) => {
  const db = await getDatabase();
  const timestamp = new Date().toISOString();

  const result = await db.runAsync("INSERT INTO notifications (title, body, timestamp) VALUES (?, ?, ?)", [title, body, timestamp]);

  return result.lastInsertRowId;
};

const fetchNotifications = async () => {
  const db = await getDatabase();
  return await db.getAllAsync("SELECT * FROM notifications ORDER BY timestamp DESC");
};

export { setupNotificationsTable, saveNotification, fetchNotifications };
