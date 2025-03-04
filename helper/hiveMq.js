require('dotenv').config();
const mqtt = require('mqtt');
const { Device } = require("../models");
const { Op } = require('sequelize');
const { saveDeviceLocation } = require('./locationStore');

const { HIVEMQ_CONNECTION_STRING } = process.env;

// Create a Map to store device details for fast lookup
const deviceMap = new Map();

const connectMqtt = async () => {
  try {
    const devices = await Device.findAll({
      where: {
        parentId: { [Op.ne]: null },
        userId: { [Op.ne]: null },
        status: 1,
      },
    });

    if (!devices.length) {
      console.error("❌ No active devices found.");
      return;
    }

    // Store device details in the Map
    devices.forEach(device => {
      deviceMap.set(device.deviceName, device.id);
    });

    console.log("✅ Device Map initialized:", deviceMap);

    devices.forEach(device => {
      const options = {
        username: device.deviceName,
        password: device.password,
        protocol: 'wss',
        reconnectPeriod: 5000,
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      };

      const client = mqtt.connect(HIVEMQ_CONNECTION_STRING, options);

      client.on('connect', () => {
        console.log(`✅ Connected to HiveMQ Cloud as ${device.deviceName}`);
        const topic = `tracking/location/${device.deviceName}`;
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`❌ Subscription Error for ${device.deviceName}:`, err);
          } else {
            console.log(`📡 Subscribed to ${topic}`);
          }
        });
      });

      client.on('message', async (topic, message) => {
        try {
          console.log(`📥 Received message on topic: ${topic}`);
          const locationData = JSON.parse(message.toString());

          if (!locationData.latitude || !locationData.longitude) {
            console.error(`❌ Invalid location data received: ${message.toString()}`);
            return;
          }

          const deviceId = deviceMap.get(locationData.username); // Retrieve device ID from the Map

          if (!deviceId) {
            console.error(`❌ Device ID not found for ${locationData.username}`);
            return;
          }

          await saveDeviceLocation(deviceId, locationData.latitude, locationData.longitude);
        } catch (error) {
          console.error(`❌ Error processing message from ${topic}:`, error);
        }
      });

      client.on('error', (err) => {
        console.error(`❌ Connection error for ${device.deviceName}:`, err);
      });
    });
  } catch (error) {
    console.error("❌ Error connecting to MQTT:", error);
  }
};

module.exports = connectMqtt;
