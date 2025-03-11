require("dotenv").config();
const mqtt = require("mqtt");
const { Device } = require("../models");
const { Op } = require("sequelize");
const { saveDeviceLocation } = require("../helper/locationStore");

const { HIVEMQ_CONNECTION_STRING } = process.env;

// Maps to track MQTT clients and inactivity timers
const clientMap = new Map();
const deviceTimeouts = new Map();

// Function to subscribe a device
const subscribeDevice = async (device) => {
  if (clientMap.has(device.deviceName)) {
    console.log(`⚠️ MQTT Client already exists for ${device.deviceName}`);
    return;
  }

  if(!device.password){
    device = await Device.findOne({
      where: {
        deviceName: device,
      },
    });
  }

  const options = {
    username: device.deviceName,
    password: device.password,
    protocol: "wss",
    reconnectPeriod: 5000,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  };

  const client = mqtt.connect(HIVEMQ_CONNECTION_STRING, options);
  clientMap.set(device.deviceName, { client, deviceId: device.id }); // Store both client & device ID

  client.on("connect", () => {
    console.log(`✅ Connected to MQTT as ${device.deviceName}`);

    const topics = [
      `tracking/location/${device.deviceName}`,
      `tracking/danger/${device.deviceName}`,
    ];

    client.subscribe(topics, (err) => {
      if (err) console.error(`❌ Subscription Error:`, err);
      else console.log(`📡 Subscribed to:`, topics);
    });
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const { deviceId } = clientMap.get(device.deviceName);

      if (!deviceId) {
        console.error(`❌ Device ID not found for ${device.deviceName}`);
        return;
      }

      if (topic.includes("location")) {
        await saveDeviceLocation(deviceId, data.latitude, data.longitude);
        await Device.update({ status: 1 }, { where: { id: deviceId } });

        console.log(`✅ Device ${device.deviceName} is ACTIVE`);

        // Reset inactivity timeout
        if (deviceTimeouts.has(deviceId)) {
          clearTimeout(deviceTimeouts.get(deviceId));
        }

        // Set a timeout to mark the device as inactive if no updates in 30s
        const timeout = setTimeout(async () => {
          await Device.update({ status: 2 }, { where: { id: deviceId } });
          console.log(`⏳ Device ${device.deviceName} is now INACTIVE (No updates in 30s)`);
        }, 30000);

        deviceTimeouts.set(deviceId, timeout);
      } else if (topic.includes("danger")) {
        await saveDeviceLocation(deviceId, data.latitude, data.longitude, 2);
        console.log(`🚨 Danger alert received from ${device.deviceName}`);
      }
    } catch (error) {
      console.error(`❌ Error processing message:`, error);
    }
  });

  client.on("error", (err) => console.error(`❌ MQTT Error:`, err));
};

// Function to unsubscribe a device
const unsubscribeDevice = (deviceName) => {
  if (clientMap.has(deviceName)) {
    const { client } = clientMap.get(deviceName);
    client.end(); // Disconnect MQTT
    clientMap.delete(deviceName); // Remove from tracking
    console.log(`🛑 Disconnected MQTT client for ${deviceName}`);
  } else {
    console.log(`⚠️ Device ${deviceName} was not actively subscribed.`);
  }
};

// Function to initialize all devices
const connectMqtt = async () => {
  try {
    await Device.update({ status: 2 }, { where: { status: 1 } });
    console.log("🔄 Reset all active devices to INACTIVE at startup");

    const devices = await Device.findAll({
      where: {
        parentId: { [Op.ne]: null },
        userId: { [Op.ne]: null },
      },
    });

    if (!devices.length) {
      console.log("❌ No active devices found.");
      return;
    }

    devices.forEach((device) => subscribeDevice(device));
  } catch (error) {
    console.error("❌ Error connecting to MQTT:", error);
  }
};

// Export functions
module.exports = { connectMqtt, subscribeDevice, unsubscribeDevice, clientMap };
