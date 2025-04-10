/**
 * Processes a Unix timestamp and returns a formatted date and time object
 * @param {number} unixTime - Unix timestamp in seconds
 * @returns {Object} Object with formatted date and time
 */
function formatDateTime(unixTime) {
  // Convert Unix timestamp (seconds) to milliseconds
  const date = new Date(unixTime * 1000);
  const now = new Date();

  // Create date string (today, yesterday, tomorrow, or month/day)
  let dateStr;

  // Reset hours, minutes, seconds, and milliseconds for date comparison
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Compare dates
  if (targetDate.getTime() === today.getTime()) {
    dateStr = "Today";
  } else if (targetDate.getTime() === yesterday.getTime()) {
    dateStr = "Yesterday";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateStr = "Tomorrow";
  } else {
    // Format as Month Day (e.g., "April 10")
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dateStr = `${months[date.getMonth()]} ${date.getDate()}`;
  }

  // Format time in 12-hour format with AM/PM
  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  const timeStr = `${hours}${ampm}`;

  // Return formatted object
  return {
    date: dateStr,
    time: timeStr,
  };
}

export default formatDateTime;


