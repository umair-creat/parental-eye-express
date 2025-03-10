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
        
        // Subscribe to location updates
        const locationTopic = `tracking/location/${device.deviceName}`;
        client.subscribe(locationTopic, (err) => {
          if (err) console.error(`❌ Subscription Error: ${err}`);
          else console.log(`📡 Subscribed to ${locationTopic}`);
        });

        // Subscribe to danger alerts
        const dangerTopic = `tracking/danger/${device.deviceName}`;
        client.subscribe(dangerTopic, (err) => {
          if (err) console.error(`❌ Subscription Error: ${err}`);
          else console.log(`🚨 Subscribed to ${dangerTopic}`);
        });
      });

      client.on('message', async (topic, message) => {
        try {
          console.log(`📥 Received message on topic: ${topic}`);
          const data = JSON.parse(message.toString());

          if (topic.startsWith("tracking/location/")) {
            // Process normal location updates
            if (!data.latitude || !data.longitude) {
              console.error(`❌ Invalid location data: ${message.toString()}`);
              return;
            }

            const deviceId = deviceMap.get(data.username);
            if (!deviceId) {
              console.error(`❌ Device ID not found for ${data.username}`);
              return;
            }

            await saveDeviceLocation(deviceId, data.latitude, data.longitude);
          } 
          else if (topic.startsWith("tracking/danger/")) {
            // Process danger alerts
            if (!data.latitude || !data.longitude) {
              console.error(`❌ Invalid danger alert: ${message.toString()}`);
              return;
            }

            const deviceId = deviceMap.get(data.username);
            if (!deviceId) {
              console.error(`❌ Device ID not found for ${data.username}`);
              return;
            }

            // Save the danger alert as a location status update
            await saveDeviceLocation(deviceId, data.latitude, data.longitude, 2); // 2 = Danger
            console.log(`🚨 Danger alert received from ${data.username}`);
          }
        } catch (error) {
          console.error(`❌ Error processing message:`, error);
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
