require('dotenv').config();
const mqtt = require('mqtt');
const { Device } = require("../models");
const { Op } = require('sequelize');
const { HIVEMQ_CONNECTION_STRING } = process.env;

const connectMqtt = async () => {
  try {
    // Fetch all devices that match the criteria
    const devices = await Device.findAll({
      where: {
        parentId: { [Op.ne]: null }, // Ensures parentId is not null
        // userId: { [Op.ne]: null },   // Ensures userId is not null
        status: 1,                   // Ensures status is 1 (active)
      },
    });

    if (!devices.length) {
      console.error("❌ No active devices found with a parentId and userId.");
      return;
    }

    devices.forEach(device => {
      const options = {
        username: device.deviceName,
        password: device.password,
        protocol: 'wss',
        reconnectPeriod: 5000,
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`, // Unique clientId
      };

      const client = mqtt.connect(HIVEMQ_CONNECTION_STRING, options);

      client.on('connect', () => {
        console.log(`✅ Connected to HiveMQ Cloud as ${device.deviceName}`);
        client.subscribe(`tracking/location/${device.deviceName}`, (err) => {
          if (err) {
            console.error(`❌ Subscription Error for device ${device.deviceName}:`, err);
          } else {
            console.log(`📡 Subscribed to tracking/location/${device.deviceName}`);
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const location = JSON.parse(message.toString());
          console.log(`📍 Location Received from ${topic}: Latitude ${location.latitude}, Longitude ${location.longitude}`);
        } catch (error) {
          console.error(`❌ Error parsing message from ${topic}:`, error);
        }
      });

      client.on('error', (err) => {
        console.error(`❌ Connection error for device ${device.deviceName}:`, err);
      });
    });
  } catch (error) {
    console.error("❌ Error connecting to MQTT:", error);
  }
};

module.exports = connectMqtt;
