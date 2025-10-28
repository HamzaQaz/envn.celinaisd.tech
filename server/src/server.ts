import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import http from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import db from './db';
import dashboardData from './utils/dashboardData';
import apiRouter from './routes/api';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_secret_key_12345',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

// CORS for development
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);

// Authentication endpoint
app.post('/api/login', (req: Request, res: Response) => {
  if (req.body.password === 'temp') {
    req.session.loggedIn = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.post('/api/logout', (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ success: true, message: 'Logged out' }));
});

app.get('/api/check-auth', (req: Request, res: Response) => {
  res.json({ loggedIn: !!req.session.loggedIn });
});

// Socket.IO connection handling
let prevSnapshot: any = null;

io.on('connection', async (socket) => {
  console.log('Socket connected (server-side):', socket.id);
  try {
    const full = await dashboardData.getDashboardData();
    socket.emit('dashboard:full', full);
  } catch (err) {
    console.error('Error sending full dashboard to socket', err);
  }
});

// Periodically compute diffs and emit only changes
setInterval(async () => {
  try {
    const current = await dashboardData.getDashboardData();

    if (!prevSnapshot) {
      io.emit('dashboard:full', current);
      prevSnapshot = current;
      return;
    }

    const prevMap = new Map(prevSnapshot.deviceData.map((d: any) => [d.Name, d]));
    const currMap = new Map(current.deviceData.map((d: any) => [d.Name, d]));

    const added: any[] = [];
    const updated: any[] = [];

    for (const [name, curr] of currMap) {
      const prev = prevMap.get(name);
      if (!prev) {
        added.push(curr);
        continue;
      }
      if (
        (curr as any).temp !== (prev as any).temp ||
        (curr as any).humidity !== (prev as any).humidity ||
        (curr as any).status !== (prev as any).status ||
        (curr as any).time !== (prev as any).time ||
        (curr as any).type !== (prev as any).type
      ) {
        updated.push(curr);
      }
    }

    const removed: string[] = [];
    for (const [name] of prevMap) {
      if (!currMap.has(name)) removed.push(name);
    }

    const summaryChanged: any = {};
    if (!prevSnapshot) {
      Object.assign(summaryChanged, current.summary);
    } else {
      for (const k of Object.keys(current.summary || {})) {
        if (String(current.summary[k]) !== String(prevSnapshot.summary?.[k])) {
          summaryChanged[k] = current.summary[k];
        }
      }
    }

    if (added.length || updated.length || removed.length || Object.keys(summaryChanged).length) {
      io.emit('dashboard:diff', { added, updated, removed, summary: summaryChanged });
    }

    prevSnapshot = current;
  } catch (err) {
    console.error('Error generating dashboard diff', err);
  }
}, 5000);

// Cleanup unknown devices
setInterval(async () => {
  try {
    const [unknown] = await db.query('SELECT * FROM unknowndevices');
    if (unknown.length === 0) return console.log('no unknowndevices.');
    const [result] = await db.query(
      'DELETE FROM unknowndevices WHERE LastSeen < NOW() - INTERVAL 10 MINUTE'
    );
    console.log(result);
  } catch (err) {
    console.error('Err cleaning UNKNOWDEVICES', err);
  }
}, 300000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { io };
