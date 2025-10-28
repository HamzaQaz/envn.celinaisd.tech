import db from '../db';
import timeago from 'timeago.js';

interface Device {
  Name: string;
  [key: string]: any;
}

interface DashboardData {
  deviceData: any[];
  locations: any[];
  alerts: string[];
  filter: string;
  summary: {
    totalLocations: number;
    activeAlerts: number;
    avgTemp: number | string;
    avgHumidity: number | string;
  };
}

async function getDashboardData(filter = ''): Promise<DashboardData> {
  const alerts: string[] = [];

  const [devices] = await db.query(
    'SELECT * FROM devices ORDER BY CAMPUS, LOCATION'
  );
  const [locations] = await db.query('SELECT * FROM locations ORDER BY ID');

  const deviceDataPromises = (devices as Device[]).map(async (device) => {
    const tableName = device.Name.replace(/[^a-zA-Z0-9_]/g, '');
    const [latestReading] = await db.query(
      `SELECT * FROM \`${tableName}\` ORDER BY id DESC LIMIT 1`
    );

    const readings = latestReading as any[];
    const Status =
      readings.length && readings[0].HUMIDITY > '55' && readings[0].TEMP > '70'
        ? 'alert'
        : 'normal';

    if (Status === 'alert' && !alerts.includes(tableName)) alerts.push(tableName);

    if (
      !filter ||
      (readings.length > 0 && readings[0].CAMPUS === filter)
    ) {
      return {
        ...device,
        temp: readings.length ? readings[0].TEMP : 'NaN',
        location: readings.length ? readings[0].LOCATION : 'Unknown Location',
        campus: readings.length ? readings[0].CAMPUS : 'N/A',
        humidity: readings.length ? readings[0].HUMIDITY : 'NaN',
        room: readings.length ? readings[0].ROOM : 'Unknown Room Location',
        status: Status,
        type: readings.length ? readings[0].TYPE : 'Not Specified',
        time: readings.length
          ? timeago.format(
              new Date(readings[0].DATE + 'T' + readings[0].TIME)
            )
          : 'N/A',
        date: readings.length
          ? new Date(readings[0].DATE).toLocaleDateString('en-US')
          : 'N/A',
      };
    }
    return null;
  });

  const deviceData = (await Promise.all(deviceDataPromises)).filter((d) => d !== null);

  const totalLocations = (locations as any[]).length;
  const activeAlerts = alerts.length;
  const avgTemp =
    deviceData.length > 0
      ? Math.round(
          deviceData.reduce((s, d) => s + (isNaN(Number(d.temp)) ? 0 : Number(d.temp)), 0) /
            deviceData.length
        )
      : 'N/A';
  const avgHumidity =
    deviceData.length > 0
      ? Math.round(
          deviceData.reduce((s, d) => s + (isNaN(Number(d.humidity)) ? 0 : Number(d.humidity)), 0) /
            deviceData.length
        )
      : 'N/A';

  return {
    deviceData,
    locations: locations as any[],
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

export default { getDashboardData };
