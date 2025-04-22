/**
 * Processes an ISO 8601 timestamp and returns a formatted date and time object
 * @param {string} isoTimestamp - ISO 8601 format timestamp (e.g. 2024-04-15T13:23:00Z)
 * @returns {Object} Object with formatted date and time
 */
function formatDateTime(isoTimestamp) {
  const date = new Date(isoTimestamp);
  const now = new Date();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Set time to midnight for accurate date comparison
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  let dateStr;
  if (targetDate.getTime() === today.getTime()) {
    dateStr = "Today";
  } else if (targetDate.getTime() === yesterday.getTime()) {
    dateStr = "Yesterday";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateStr = "Tomorrow";
  } else {
    dateStr = `${months[date.getMonth()]} ${date.getDate()}`;
  }

  // Format time
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const timeStr = `${hours}${ampm}`;
  const detailed_timeStr = `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}${ampm}`;

  return {
    date: dateStr,
    time: timeStr,
    detailed_time: detailed_timeStr,
  };
}

/**
 * Converts a Unix timestamp (in seconds) to an ISO 8601 string
 * @param {number} unixSeconds - Unix timestamp in seconds
 * @returns {string} ISO 8601 timestamp string
 */
function convertUnixToISO(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString();
}

export { formatDateTime, convertUnixToISO };
