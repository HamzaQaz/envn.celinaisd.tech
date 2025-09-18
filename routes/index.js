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


router.get("/", async (req, res) => {
  const filter = req.query.filter || "";

  try {
    const [devices] = await db.query(
      "SELECT * FROM devices ORDER BY CAMPUS, LOCATION"
    );
    const [locations] = await db.query("SELECT * FROM locations ORDER BY ID");

    
    const deviceDataPromises = devices.map(async (device) => {
      
      const tableName = device.Name.replace(/[^a-zA-Z0-9_]/g, "");
      const [latestReading] = await db.query(
        `SELECT * FROM \`${tableName}\` ORDER BY id DESC LIMIT 1`
      );
      
     
      
      

     Status = latestReading.length && latestReading[0].HUMIDITY > "55" && latestReading[0].TEMP > "70" ? "alert" : "normal"
     if (Status === "alert") {
      if (alerts.length === 0 ){
        alerts.push(latestReading.id)
        console.log(alerts)
      } else {
        if (alerts.length > 0) {
          alerts.reduce(latestReading.id)
        }
      }
     }

      if (
        !filter ||
        (latestReading.length > 0 && latestReading[0].CAMPUS === filter)
      ) {
        return {
          ...device, 
          temp: latestReading.length ? latestReading[0].TEMP : "NaN",
          location: latestReading.length ? latestReading[0].LOCATION : "Unknown Location",
          campus: latestReading.length ? latestReading[0].CAMPUS : "N/A",
          humidity: latestReading.length ? latestReading[0].HUMIDITY : "NaN",
          room: latestReading.length ? latestReading[0].ROOM : "Unknown Room Location",
          status: Status,
          type: latestReading.length ? latestReading[0].TYPE : "Not Specified",
          time: latestReading.length
            ? timeago.format(new Date(
                latestReading[0].DATE + "T" + latestReading[0].TIME
              ))
            : "N/A",
          date: latestReading.length
            ? new Date(latestReading[0].DATE).toLocaleDateString("en-US")
            : "N/A",
        };
      }
      return null;
    });

    const deviceData = (await Promise.all(deviceDataPromises)).filter(
      (d) => d !== null
    );

    res.render("index", {
      title: "Temperature Alarms",
      deviceData,
      locations,
      alertcount,
      filter
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error on the main page.");
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
