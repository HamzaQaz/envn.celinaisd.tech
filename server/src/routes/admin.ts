import express, { Request, Response } from 'express';
import db from '../db';

const router = express.Router();

// GET admin data
router.get('/', async (req: Request, res: Response) => {
  try {
    const [devices] = await db.query('SELECT * FROM devices ORDER BY Name');
    const [locations] = await db.query('SELECT * FROM locations ORDER BY NAME');
    const [alarms] = await db.query('SELECT * FROM alarms ORDER BY ID');
    const [unknowndevices] = await db.query(
      'SELECT * FROM unknowndevices ORDER BY LastSeen DESC'
    );

    res.json({
      devices,
      locations,
      alarms,
      unknowndevices,
    });
  } catch (err) {
    console.error('Database error on admin page:', err);
    res.status(500).json({ error: 'Database error on admin page.' });
  }
});

// Add device
router.post('/device/add', async (req: Request, res: Response) => {
  const { name, campus, location, type, room } = req.body;

  if (!name || !campus || !location || !type || !room) {
    return res.status(400).json({ error: 'Missing required fields to add a device.' });
  }

  const dbSafeName = name.replace(/-/g, '_');

  try {
    await db.query(
      'INSERT INTO devices (Name, Campus, Location, Type, Room) VALUES (?, ?, ?, ?, ?)',
      [dbSafeName, campus, location, type, room]
    );
    console.log(dbSafeName, campus, location, type, room);

    const createTableSql = `CREATE TABLE IF NOT EXISTS \`${dbSafeName}\` (
      \`ID\` int(11) NOT NULL AUTO_INCREMENT,
      \`CAMPUS\` varchar(20) NOT NULL,
      \`LOCATION\` varchar(20) NOT NULL,
      \`TEMP\` int(20) NOT NULL,
      \`DATE\` varchar(20),
      \`TIME\` varchar(20),
      \`HUMIDITY\` int(20) NOT NULL,
      \`ROOM\` varchar(50) NOT NULL,
      \`TYPE\` varchar(20) NOT NULL,
      PRIMARY KEY (\`ID\`)
    )`;

    await db.query(createTableSql);

    res.json({ success: true, message: 'Device added successfully' });
  } catch (err) {
    console.error('Failed to add device:', err);
    res.status(500).json({ error: 'Failed to add device. Check server logs for details.' });
  }
});

// Delete device
router.delete('/device/:id/:name', async (req: Request, res: Response) => {
  const { id, name } = req.params;
  try {
    await db.query('DELETE FROM devices WHERE ID = ?', [id]);

    const tableName = name.replace(/[^a-zA-Z0-9_]/g, '');
    await db.query(`DROP TABLE IF EXISTS \`${tableName}\``);

    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (err) {
    console.error('Failed to delete device:', err);
    res.status(500).json({ error: 'Failed to delete device.' });
  }
});

// Add location
router.post('/location/add', async (req: Request, res: Response) => {
  const { name, shortcode } = req.body;
  try {
    await db.query('INSERT INTO locations (NAME, SHORTCODE) VALUES (?, ?)', [name, shortcode]);
    res.json({ success: true, message: 'Location added successfully' });
  } catch (err) {
    console.error('Failed to add location:', err);
    res.status(500).json({ error: 'Failed to add location.' });
  }
});

// Delete location
router.delete('/location/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM locations WHERE ID = ?', [id]);
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Failed to delete location:', err);
    res.status(500).json({ error: 'Failed to delete location.' });
  }
});

// Add alarm
router.post('/alarm/add', async (req: Request, res: Response) => {
  const { email, temp } = req.body;
  try {
    await db.query('INSERT INTO alarms (EMAIL, TEMP) VALUES (?, ?)', [email, temp]);
    res.json({ success: true, message: 'Alarm added successfully' });
  } catch (err) {
    console.error('Failed to add alarm:', err);
    res.status(500).json({ error: 'Failed to add alarm.' });
  }
});

// Delete alarm
router.delete('/alarm/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM alarms WHERE ID = ?', [id]);
    res.json({ success: true, message: 'Alarm deleted successfully' });
  } catch (err) {
    console.error('Failed to delete alarm:', err);
    res.status(500).json({ error: 'Failed to delete alarm.' });
  }
});

export default router;
