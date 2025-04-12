/**
 * Processes a Unix timestamp and returns a formatted date and time object
 * @param {number} unixTime - Unix timestamp in seconds
 * @returns {Object} Object with formatted date and time
 */
function formatDateTime(unixTime) {
  const date = new Date(unixTime * 1000);
  const now = new Date();

  let dateStr;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    dateStr = "Today";
  } else if (targetDate.getTime() === yesterday.getTime()) {
    dateStr = "Yesterday";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateStr = "Tomorrow";
  } else {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dateStr = `${months[date.getMonth()]} ${date.getDate()}`;
  }

  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const minutes = date.getMinutes().toString().padStart(2, "0");

  const timeStr = `${hours}${ampm}`;
  const detailed_timeStr = `${hours}:${minutes} ${ampm}`;

  return {
    date: dateStr,
    time: timeStr,
    detailed_time: detailed_timeStr,
  };
}

export default formatDateTime;
