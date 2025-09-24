const express = require("express");
const router = express.Router();
router.use(express.json());
const db = require("../db");
const nodemailer = require("nodemailer");
const { exec } = require('child_process'); // child



  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'lucius.schuppe@ethereal.email',
      pass: '17AKSsvsBtAp25vwMG'
    }
  });

const muted_devices = [
    "ESP_21A8EB",
    "ESP_7C28E8",
    "ESP_0DF2C4"
]

  router.post("/write", async (req, res) => {
    const { table, temp, humidity, mac, ip } = req.body;
    if (table === muted_devices) {
        return res.status(400).send("This device has been temporaliy muted for testing.")
        
    }
    if (temp === "NaN" && humidity === "NaN") {
	temp = 400
	humidity = 400
	
    }
    if (!table || !temp || !humidity) {
      return res.status(400).send("Missing 'table', 'temp', or 'humidity' query parameter.");
    }

    const offsetTemp = parseInt(temp) - 2;
    const tableName = table.replace(/-/g, "_");

    try {
      const [devices] = await db.query("SELECT * FROM devices WHERE Name = ?", [tableName]);
      if (devices.length === 0) {
        const [unknown] = await db.query("SELECT * FROM unknowndevices WHERE NAME = ? or MAC = ?", [tableName, mac]);
        if (unknown.length === 0) {
          await db.query(
            "INSERT INTO unknowndevices (NAME, MAC, IP, FIRSTSEEN, LastSeen) VALUES (?, ?, ?, NOW(), NOW())",
            [tableName, mac, ip]
          );
          console.log(`Unknown Device Found: ${tableName}, ${mac}, ${ip}`);
        } else {
          await db.query(
            "UPDATE unknowndevices SET LastSeen = NOW() WHERE MAC = ?",
            [mac]
          );
          console.log(`Unknown Device LastSeen updated: ${tableName}, ${mac}, ${ip}`);
        }
        return res.status(200).json({ message: "Unknown device recorded", timestamp: new Date().toISOString() });
      } else {
        await db.query(
          "UPDATE unknowndevices SET LastSeen = NOW() WHERE MAC = ?",
          [mac] 
        );

        const device = devices[0];
        const { Location, Campus, Room, Type } = device;
        const now = new Date();
        const date = now.toLocaleDateString("en-US", { timeZone: "America/Chicago" });
        const time = now.toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour12: false });

        // Insert into DB
        const insertSql = `INSERT INTO \`${tableName}\` (CAMPUS, LOCATION, DATE, TIME, TEMP, HUMIDITY, ROOM, TYPE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(insertSql, [Campus, Location, date, time, offsetTemp, humidity, Room, Type]);

        // Check alarm
        const [alarms] = await db.query("SELECT * FROM alarms");
        for (const alarm of alarms) {
          if (parseFloat(temp) >= parseFloat(alarm.TEMP)) {
            (async () => {
              const mail = await transporter.sendMail({
                from: '"Lucius Schuppe" <lucius.schuppe@ethereal.email>',
                to: `nightlydevz@gmail.com`,
                subject: `Device ${tableName}'s temp has reached the threshold`,
                text: `ALARM: Device ${tableName} temperature ${temp} is over the threshold of ${alarm.TEMP}`
              });
              console.log("Message sent:", mail.messageId);
            })();
          }
        }

        res.status(200).json({ message: "Record created successfully", timestamp: now.toISOString() });
      }
    } catch (err) {
      console.error("API Write Error:", err);
      res.status(500).send("Error processing your request.");
    }
  });

  router.post("/webhook", (req, res) => {
    
      exec('git -C /root/envn.celinaisd.tech pull origin main', (err, stdout, stderr) => {
        if (err) {
          console.error('Git pull failed', stderr)
          return res.status(500).send('Git pull failed')
        }
        console.log('Git pull output', stdout);
        res.status(200).send(stdout);
      });

      
    
  });
  router.post("/log", (req, res) => {
      const { lines } = req.body
    
      exec(`pm2 logs 0 --lines ${lines}`, (err, stdout, stderr) => {
        if (err) {
          console.error('log pull failed')
          return res.status(500).send('log pull failed')
        }
        
        res.status(200).send(stdout);
      });

      
    
  });

  module.exports = router;
