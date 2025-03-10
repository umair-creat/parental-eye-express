require('dotenv').config();
const mqtt = require('mqtt');
const { saveDeviceLocation } = require('./locationStore');

const { HIVEMQ_CONNECTION_STRING } = process.env;
const deviceMap = new Map(); // Shared device map
const clientMap = new Map(); // Store active MQTT clients

// Function to subscribe a device
const subscribeDevice = (device) => {
  const options = {
    username: device.deviceName,
    password: device.password,
    protocol: 'wss',
    reconnectPeriod: 5000,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  };

  const client = mqtt.connect(HIVEMQ_CONNECTION_STRING, options);
  clientMap.set(device.deviceName, client); // Store client reference

  client.on('connect', () => {
    console.log(`✅ Connected to HiveMQ as ${device.deviceName}`);

    // Subscribe to location updates
    const locationTopic = `tracking/location/${device.deviceName}`;
    client.subscribe(locationTopic, (err) => {
      if (err) console.error(`❌ Subscription Error on ${locationTopic}: ${err}`);
      else console.log(`📡 Subscribed to ${locationTopic}`);
    });

    // Subscribe to danger alerts
    const dangerTopic = `tracking/danger/${device.deviceName}`;
    client.subscribe(dangerTopic, (err) => {
      if (err) console.error(`❌ Subscription Error on ${dangerTopic}: ${err}`);
      else console.log(`🚨 Subscribed to ${dangerTopic}`);
    });
  });

  client.on('message', async (topic, message) => {
    try {
      console.log(`📥 Received message on topic: ${topic}`);
      const data = JSON.parse(message.toString());

      if (topic.startsWith("tracking/location/")) {
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
        if (!data.latitude || !data.longitude) {
          console.error(`❌ Invalid danger alert: ${message.toString()}`);
          return;
        }

        const deviceId = deviceMap.get(data.username);
        if (!deviceId) {
          console.error(`❌ Device ID not found for ${data.username}`);
          return;
        }

        // Save danger alert with a different status (e.g., 2)
        await saveDeviceLocation(deviceId, data.latitude, data.longitude, 2);
        console.log(`🚨 Danger alert received from ${data.username}`);
      }
    } catch (error) {
      console.error(`❌ Error processing message:`, error);
    }
  });

  client.on('error', (err) => {
    console.error(`❌ Connection error for ${device.deviceName}:`, err);
  });
};

// Function to unsubscribe a device
const unsubscribeDevice = (deviceName) => {
  const client = clientMap.get(deviceName);
  if (client) {
    client.end(); // Disconnect the client
    clientMap.delete(deviceName);
    console.log(`🛑 Disconnected MQTT client for ${deviceName}`);
  } else {
    console.log(`⚠️ No active MQTT client found for ${deviceName}`);
  }
};

// Export functions
module.exports = {
  subscribeDevice,
  unsubscribeDevice,
  deviceMap, // Export deviceMap to ensure it's shared across the app
};
