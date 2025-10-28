import express, { Request, Response } from 'express';
import db from '../db';
import nodemailer from 'nodemailer';
import { exec } from 'child_process';

const router = express.Router();
router.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'lucius.schuppe@ethereal.email',
    pass: '17AKSsvsBtAp25vwMG',
  },
});

const muted_devices = ['ESP_TEST9API'];

router.post('/write', async (req: Request, res: Response) => {
  const { table, temp, humidity, mac, ip } = req.body;
  
  if (muted_devices.includes(table)) {
    return res.status(400).send('This device has been temporarily muted for testing.');
  }

  if (!table || !temp || !humidity || !mac || !ip) {
    return res.status(400).send("Missing 'table', 'temp', 'humidity', 'mac', or 'ip' parameter.");
  }

  const offsetTemp = parseInt(temp) - 2;
  const tableName = table.replace(/-/g, '_');

  try {
    const [devices] = await db.query('SELECT * FROM devices WHERE Name = ?', [tableName]);
    
    if ((devices as any[]).length === 0) {
      const [unknown] = await db.query(
        'SELECT * FROM unknowndevices WHERE NAME = ? or MAC = ?',
        [tableName, mac]
      );
      
      if ((unknown as any[]).length === 0) {
        await db.query(
          'INSERT INTO unknowndevices (NAME, MAC, IP, FIRSTSEEN, LastSeen) VALUES (?, ?, ?, NOW(), NOW())',
          [tableName, mac, ip]
        );
        console.log(`Unknown Device Found: ${tableName}, ${mac}, ${ip}`);
      } else {
        await db.query('UPDATE unknowndevices SET LastSeen = NOW() WHERE MAC = ?', [mac]);
        console.log(`Unknown Device LastSeen updated: ${tableName}, ${mac}, ${ip}`);
      }
      
      return res.status(200).json({ 
        message: 'Unknown device recorded', 
        timestamp: new Date().toISOString() 
      });
    } else {
      await db.query('UPDATE unknowndevices SET LastSeen = NOW() WHERE MAC = ?', [mac]);

      const device = (devices as any[])[0];
      const { Location, Campus, Room, Type } = device;
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
      const time = now.toLocaleTimeString('en-US', { 
        timeZone: 'America/Chicago', 
        hour12: false 
      });

      const insertSql = `INSERT INTO \`${tableName}\` (CAMPUS, LOCATION, DATE, TIME, TEMP, HUMIDITY, ROOM, TYPE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      await db.query(insertSql, [Campus, Location, date, time, offsetTemp, humidity, Room, Type]);

      const [alarms] = await db.query('SELECT * FROM alarms');
      for (const alarm of alarms as any[]) {
        if (parseFloat(temp) >= parseFloat(alarm.TEMP)) {
          (async () => {
            const mail = await transporter.sendMail({
              from: '"Lucius Schuppe" <lucius.schuppe@ethereal.email>',
              to: `nightlydevz@gmail.com`,
              subject: `Device ${tableName}'s temp has reached the threshold`,
              text: `ALARM: Device ${tableName} temperature ${temp} is over the threshold of ${alarm.TEMP}`,
            });
            console.log('Message sent:', mail.messageId);
          })();
        }
      }

      res.status(200).json({ 
        message: 'Record created successfully', 
        timestamp: now.toISOString() 
      });
    }
  } catch (err) {
    console.error('API Write Error:', err);
    res.status(500).send('Error processing your request.');
  }
});

router.post('/webhook', (req: Request, res: Response) => {
  exec('git -C /root/envn.celinaisd.tech pull origin main', (err, stdout, stderr) => {
    if (err) {
      console.error('Git pull failed', stderr);
      return res.status(500).send('Git pull failed');
    }

    console.log('Git pull output', stdout);
    console.log('Restarting server...');
    res.status(200).send(stdout);
  });
});

// GET dashboard data endpoint
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboardData = await import('../utils/dashboardData');
    const filter = (req.query.filter as string) || '';
    const payload = await dashboardData.default.getDashboardData(filter);
    res.json(payload);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET history endpoint
router.get('/history', async (req: Request, res: Response) => {
  const { table, date } = req.query;
  
  if (!table) {
    return res.status(400).json({ error: 'Device table not specified.' });
  }

  const searchDate =
    (date as string) ||
    new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });

  try {
    const tableName = (table as string).replace(/[^a-zA-Z0-9_]/g, '');

    const [deviceInfo] = await db.query(
      'SELECT Location, Campus FROM devices WHERE Name = ? LIMIT 1',
      [tableName]
    );

    const [historyData] = await db.query(
      `SELECT time, temp FROM \`${tableName}\` WHERE date = ?`,
      [searchDate]
    );

    res.json({
      device: (deviceInfo as any[]).length
        ? (deviceInfo as any[])[0]
        : { Location: 'Unknown', Campus: 'Unknown' },
      history: historyData,
      currentDate: searchDate,
      tableName: tableName,
    });
  } catch (err) {
    console.error(`Error fetching history for ${table}:`, err);
    res.status(500).json({ error: 'Could not retrieve sensor history.' });
  }
});

// GET unknown devices
router.get('/unknown-devices', async (req: Request, res: Response) => {
  try {
    const [unknowndevices] = await db.query(
      'SELECT * FROM unknowndevices ORDER BY LastSeen DESC'
    );
    res.json(unknowndevices);
  } catch (err) {
    console.error('Error fetching unknown devices:', err);
    res.status(500).json({ error: 'Failed to fetch unknown devices' });
  }
});

export default router;
