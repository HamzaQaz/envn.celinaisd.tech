# envn.celinaisd.tech

[![Repo language](https://img.shields.io/github/languages/top/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech)
[![Stars](https://img.shields.io/github/stars/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/stargazers)
[![Forks](https://img.shields.io/github/forks/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/network/members)
[![Open Issues](https://img.shields.io/github/issues/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/issues)
[![License](https://img.shields.io/github/license/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/HamzaQaz/envn.celinaisd.tech/main?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/commits/main)

A modern environmental monitoring system for tracking temperature and humidity across multiple locations with real-time updates via WebSockets.

---

## Tech Stack

### Frontend
- **React** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **Socket.io** - Real-time bidirectional communication
- **MySQL** - Database (mysql2 driver)
- **Session-based Auth** - express-session
- **Nodemailer** - Email notifications

---

## Project Structure

```
envn.celinaisd.tech/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── History.tsx
│   │   │   └── Login.tsx
│   │   ├── services/      # API and socket services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helper functions
│   │   ├── types/        # TypeScript types
│   │   ├── server.ts     # Main server file
│   │   └── db.ts         # Database connection
│   └── tsconfig.json
├── public/               # Static assets (legacy)
├── views/                # EJS views (legacy, to be removed)
└── package.json          # Root package.json
```

---

## Features

- **Real-time Monitoring** - Live updates via WebSocket connections
- **Dashboard View** - Overview of all sensors with status indicators
- **Historical Data** - View temperature history by date and device
- **Admin Panel** - Manage devices, locations, and alarm thresholds
- **Responsive Design** - Works on desktop and mobile devices
- **Alert System** - Email notifications when thresholds are exceeded
- **Unknown Device Detection** - Track and identify new devices
- **Session-based Authentication** - Secure access control

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HamzaQaz/envn.celinaisd.tech.git
   cd envn.celinaisd.tech
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=your_db_name
   
   # Server
   PORT=3000
   SESSION_SECRET=your_secret_key_here
   
   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```
   
   Create a `.env` file in the `client/` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

5. **Set up the database**
   
   Run the SQL schema from `data.sql` to create the necessary tables.

### Development

To run both frontend and backend in development mode:

```bash
# Run both concurrently
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3000`

### Production Build

```bash
# Build both frontend and backend
npm run build

# Or build separately:
npm run build:server  # Compiles TypeScript backend
npm run build:client  # Builds React frontend
```

---

## API Endpoints

### Authentication
- `POST /api/login` - Login with password
- `POST /api/logout` - Logout
- `GET /api/check-auth` - Check authentication status

### Dashboard
- `GET /api/dashboard?filter=CAMPUS` - Get dashboard data with optional campus filter
- `GET /api/history?table=DEVICE&date=DATE` - Get historical sensor data
- `GET /api/unknown-devices` - List unknown/unregistered devices

### Device Data
- `POST /api/write` - Submit sensor data (for IoT devices)
  ```json
  {
    "table": "device_name",
    "temp": 72,
    "humidity": 45,
    "mac": "AA:BB:CC:DD:EE:FF",
    "ip": "192.168.1.100"
  }
  ```

### Admin
- `GET /api/admin` - Get all admin data (devices, locations, alarms)
- `POST /api/admin/device/add` - Add a new device
- `DELETE /api/admin/device/:id/:name` - Delete a device
- `POST /api/admin/location/add` - Add a new location
- `DELETE /api/admin/location/:id` - Delete a location
- `POST /api/admin/alarm/add` - Add a temperature alarm
- `DELETE /api/admin/alarm/:id` - Delete an alarm

---

## WebSocket Events

### Client → Server
- `connect` - Initial connection

### Server → Client
- `dashboard:full` - Full dashboard state (on connect)
- `dashboard:diff` - Incremental updates (added, updated, removed devices)
  ```javascript
  {
    added: [Device],
    updated: [Device],
    removed: [string],
    summary: {
      totalLocations: number,
      activeAlerts: number,
      avgTemp: number,
      avgHumidity: number
    }
  }
  ```

---

## Default Login

Default password: `temp`

⚠️ **Change this in production!** Update the password check in `/server/src/server.ts`

---

## IoT Device Integration

Devices can send data to the `/api/write` endpoint:

```bash
curl -X POST http://your-server:3000/api/write \
  -H "Content-Type: application/json" \
  -d '{
    "table": "ESP_DEVICE_01",
    "temp": 72,
    "humidity": 45,
    "mac": "AA:BB:CC:DD:EE:FF",
    "ip": "192.168.1.100"
  }'
```

Unknown devices are automatically tracked for later registration.

---

## Development Notes

### Running Tests
```bash
npm test  # (if tests are configured)
```

### Linting
```bash
# Frontend
cd client && npm run lint

# Backend uses tsc for type checking
cd server && npx tsc --noEmit
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful commit messages

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Real-time updates via [Socket.io](https://socket.io/)

---

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/HamzaQaz/envn.celinaisd.tech/issues).
