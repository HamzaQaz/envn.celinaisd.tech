const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const db = require('./db')
const { exec } = require('child_process');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
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
const apiRouter = require("./routes/api")(io);
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");


// Login/session routes
// Login/session routes
app.get("/login", (req, res) => res.render("login", { title: "Login", error: null }));

app.post("/login", (req, res) => {
  if (req.body.password === "admin") {
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
app.use("/admin", requireLogin, adminRouter);



// Socket.io connection
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
