const express = require("express");
const router = express.Router();
const db = require("../db");
const timeago = require('timeago.js')

let Status = ""
let alerts = []


router.get("/login", (req, res) =>
  res.render("login", { title: "Login", error: null })
);
router.post("/login", (req, res) => {
  if (req.body.password === "admin") {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.render("login", { title: "Login", error: "Incorrect Password" });
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});


router.use((req, res, next) => {
  if (req.session.loggedIn) return next();
  res.redirect("/login");
});


const dashboardData = require('../utils/dashboardData');

router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || '';
    const payload = await dashboardData.getDashboardData(filter);
    const [unknowndevices] = await db.query(`SELECT * FROM unknowndevices ORDER BY LastSeen DESC`);
    res.render('index', {
      title: 'Temperature Alarms',
      deviceData: payload.deviceData,
      locations: payload.locations,
      alerts: payload.alerts,
      filter: payload.filter,
      unknowndevices
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error on the main page.');
  }
});

router.get("/history", async (req, res) => {
  const { table, date } = req.query;
  if (!table) return res.status(400).send("Device table not specified.");

 
  const searchDate =
    date ||
    new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

  try {
    const tableName = table.replace(/[^a-zA-Z0-9_]/g, "");

    
    const [deviceInfo] = await db.query(
      "SELECT Location, Campus FROM devices WHERE Name = ? LIMIT 1",
      [tableName]
    );

    
    const [historyData] = await db.query(
      `SELECT time, temp FROM \`${tableName}\` WHERE date = ?`,
      [searchDate]
    );

    res.render("history", {
      title: "Sensor History",
      device: deviceInfo.length
        ? deviceInfo[0]
        : { Location: "Unknown", Campus: "Unknown" },
      history: historyData,
      currentDate: searchDate,
      tableName: tableName,
    });
  } catch (err) {
    console.error(`Error fetching history for ${table}:`, err);
    res.status(500).send("Could not retrieve sensor history.");
  }
});

module.exports = router;
