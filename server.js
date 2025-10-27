const express = require("express");
const path = require("path");
const http = require("http");
const socketManager = require('./utils/socketManager');
const db = require('./db')
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();

const app = express();
const server = http.createServer(app);


const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
// Static files + body parsing
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a_very_strong_secret_key_12345",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});



// Routers
const apiRouter = require("./routes/api");
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");


// Login/session routes
app.get("/login", (req, res) => res.render("login", { title: "Login", error: null }));

app.post("/login", (req, res) => {
  if (req.body.password === "temp") {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.render("login", { title: "Login", error: "Incorrect Password" });
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Auth middleware for / and /admin
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login");
}
app.use("/api", apiRouter); // open
app.use("/", requireLogin, indexRouter);
app.use("/settings", requireLogin, adminRouter);
app.use('/admin', express.static(path.join(__dirname, 'calculator-ti-84')));




// Initialize Socket.IO using socketManager and start auto-refresh events
const io = socketManager.init(server);
const dashboardData = require('./utils/dashboardData');

// Keep previous snapshot in memory to compute diffs
let prevSnapshot = null;

// Send full snapshot to newly connected clients
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
      // first run — broadcast full payload
      io.emit('dashboard:full', current);
      prevSnapshot = current;
      return;
    }

    const prevMap = new Map(prevSnapshot.deviceData.map(d => [d.Name, d]));
    const currMap = new Map(current.deviceData.map(d => [d.Name, d]));

    const added = [];
    const updated = [];

    for (const [name, curr] of currMap) {
      const prev = prevMap.get(name);
      if (!prev) {
        added.push(curr);
        continue;
      }
      // compare important fields for changes
      if (
        curr.temp !== prev.temp ||
        curr.humidity !== prev.humidity ||
        curr.status !== prev.status ||
        curr.time !== prev.time ||
        curr.type !== prev.type
      ) {
        updated.push(curr);
      }
    }

    const removed = [];
    for (const [name] of prevMap) {
      if (!currMap.has(name)) removed.push(name);
    }

    // summary diffs
    const summaryChanged = {};
    if (!prevSnapshot) {
      Object.assign(summaryChanged, current.summary);
    } else {
      for (const k of Object.keys(current.summary || {})) {
        if (String(current.summary[k]) !== String(prevSnapshot.summary?.[k])) {
          summaryChanged[k] = current.summary[k];
        }
      }
    }

    // If any diffs exist, emit them
    if (added.length || updated.length || removed.length || Object.keys(summaryChanged).length) {
      io.emit('dashboard:diff', { added, updated, removed, summary: summaryChanged });
    }

    prevSnapshot = current;
  } catch (err) {
    console.error('Error generating dashboard diff', err);
  }
}, 5000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

setInterval(async () => {
  try {
    const unknown = await db.query("SELECT * FROM unknowndevices")
    if (unknown.length === 0) return console.log("no unknowndevices.")
    const result = await db.query(
      "DELETE FROM unknowndevices WHERE LastSeen < NOW() - INTERVAL 10 MINUTE"
    ); 
    console.log(result)
  } catch (err) {
    console.error("Err cleaning UNKNOWDEVICES", err)
  }
}, 300000);
