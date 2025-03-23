import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseAsync("@/storage/notifications.db");

const setupNotificationsTable = () => {
  db.transaction((tx) => {
    tx.executeSql("CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, timestamp TEXT);");
  });
};

const saveNotification = (title, body) => {
  const timestamp = new Date().toISOString();

  db.transaction((tx) => {
    tx.executeSql("INSERT INTO notifications (title, body, timestamp) VALUES (?, ?, ?);", [title, body, timestamp]);
  });
};

const fetchNotifications = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM notifications ORDER BY timestamp DESC;", [], (_, { rows: { _array } }) => {
      callback(_array);
    });
  });
};

export { setupNotificationsTable, saveNotification, fetchNotifications };
