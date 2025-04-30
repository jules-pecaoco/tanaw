/**
 * Returns a color based on temperature thresholds
 * @param {number} temp - Temperature value
 * @returns {string} Hex color code
 */

const getHeatIndexColor = (temp) => {
  if (temp >= 52) return "#cc0001"; // Extreme Danger
  if (temp >= 42) return "#ff6600"; // Danger
  if (temp >= 33) return "#ffcc00"; // Extreme Caution
  if (temp >= 27) return "#ffff00"; // Caution
  return "#ffff";
};

export { getHeatIndexColor };
