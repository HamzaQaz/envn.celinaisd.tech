const db = require('../db');
const timeago = require('timeago.js');

async function getDashboardData(filter = '') {
  const alerts = [];

  const [devices] = await db.query(
    'SELECT * FROM devices ORDER BY CAMPUS, LOCATION'
  );
  const [locations] = await db.query('SELECT * FROM locations ORDER BY ID');

  const deviceDataPromises = devices.map(async (device) => {
    const tableName = device.Name.replace(/[^a-zA-Z0-9_]/g, '');
    const [latestReading] = await db.query(
      `SELECT * FROM \`${tableName}\` ORDER BY id DESC LIMIT 1`
    );

    const Status =
      latestReading.length && latestReading[0].HUMIDITY > '55' && latestReading[0].TEMP > '70'
        ? 'alert'
        : 'normal';

    if (Status === 'alert' && !alerts.includes(tableName)) alerts.push(tableName);

    if (
      !filter ||
      (latestReading.length > 0 && latestReading[0].CAMPUS === filter)
    ) {
      return {
        ...device,
        temp: latestReading.length ? latestReading[0].TEMP : 'NaN',
        location: latestReading.length ? latestReading[0].LOCATION : 'Unknown Location',
        campus: latestReading.length ? latestReading[0].CAMPUS : 'N/A',
        humidity: latestReading.length ? latestReading[0].HUMIDITY : 'NaN',
        room: latestReading.length ? latestReading[0].ROOM : 'Unknown Room Location',
        status: Status,
        type: latestReading.length ? latestReading[0].TYPE : 'Not Specified',
        time: latestReading.length
          ? timeago.format(
              new Date(latestReading[0].DATE + 'T' + latestReading[0].TIME)
            )
          : 'N/A',
        date: latestReading.length
          ? new Date(latestReading[0].DATE).toLocaleDateString('en-US')
          : 'N/A',
      };
    }
    return null;
  });

  const deviceData = (await Promise.all(deviceDataPromises)).filter((d) => d !== null);

  // Summary calculations
  const totalLocations = locations.length;
  const activeAlerts = alerts.length;
  const avgTemp =
    deviceData.length > 0
      ? (
          deviceData.reduce((s, d) => s + (isNaN(Number(d.temp)) ? 0 : Number(d.temp)), 0) /
          deviceData.length
        ).toFixed(1)
      : 'N/A';
  const avgHumidity =
    deviceData.length > 0
      ? (
          deviceData.reduce((s, d) => s + (isNaN(Number(d.humidity)) ? 0 : Number(d.humidity)), 0) /
          deviceData.length
        ).toFixed(1)
      : 'N/A';

  return {
    deviceData,
    locations,
    alerts,
    filter,
    summary: {
      totalLocations,
      activeAlerts,
      avgTemp,
      avgHumidity,
    },
  };
}

module.exports = { getDashboardData };
