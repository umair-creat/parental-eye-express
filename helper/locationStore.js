const { Location } = require("../models"); // Assuming you have a Sequelize model for Location

async function saveDeviceLocation(deviceId, latitude, longitude, locationStatus, receivedAt) {
    try {
        // Convert the location to a GeoJSON format
        const geoJson = {
            type: "Point",
            coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude] order
        };

        // Insert into the database
        const location = await Location.create({
            device_id: deviceId,
            location: geoJson, // Pass GeoJSON object
            location_status: locationStatus,
            received_at: receivedAt,
        });

        console.log("✅ Location saved:");
    } catch (error) {
        console.error("❌ Error saving location:", error);
    }
}

module.exports = { saveDeviceLocation };
