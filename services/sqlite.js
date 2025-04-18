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

const saveNotification = async (title, body) => {
  const db = await getDatabase();
  const utcTimestamp = Math.floor(Date.now() / 1000);
  console.log("timestap", utcTimestamp);

  const result = await db.runAsync("INSERT INTO notifications (title, body, timestamp) VALUES (?, ?, ?)", [title, body, utcTimestamp]);

  return result.lastInsertRowId;
};

const fetchNotifications = async () => {
  const db = await getDatabase();
  return await db.getAllAsync("SELECT * FROM notifications ORDER BY timestamp DESC");
};

export { setupNotificationsTable, saveNotification, fetchNotifications };
