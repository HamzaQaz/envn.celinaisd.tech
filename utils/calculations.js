// utils/calculations.js

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");

dayjs.extend(relativeTime);

// For parsing custom date/time formats if needed
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

/**
 * Parse and analyze a sensor readin
 */
function analyzeReading(reading, thresholdMinutes = 2) {
  const now = dayjs();

  const timeString = `${reading.DATE} ${reading.TIME}`;
  const lastUpdate = dayjs(timeString, "M/D/YYYY h:mm:ss A");

  const diffMinutes = now.diff(lastUpdate, "minute");
  const isOffline = diffMinutes > thresholdMinutes;

  const status = isOffline
    ? "offline"
    : reading.HUMIDITY > 55 && reading.TEMP > 70
    ? "alert"
    : "normal";

  return {
    time: lastUpdate.fromNow(),
    date: lastUpdate.format("MM/DD/YYYY"),
    isOffline,
    status,
    lastUpdate,
    diffMinutes,
  };
}

module.exports = {
  analyzeReading,
};
