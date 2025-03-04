const { Device, Location } = require("../models");

const getLocationByUserId = async (req, res) => {
  try {
    const  {userId}  = req.body; 

    console.log(userId);
    const device = await Device.findOne({ where: { userId: userId } });

    if (!device) {
      return res.status(404).json({ message: "Device not found for this user" });
    }

    // Step 2: Fetch the latest location using deviceId
    const location = await Location.findAll({
      where: { device_id: device.id },
      order: [["received_at", "DESC"]], // Get the most recent location
    });

    if (!location) {
      return res.status(404).json({ message: "No location data available" });
    }

    return res.status(200).json({
      deviceId: device.id,
      location: location, // Location is stored as a GEOMETRY('POINT')
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getLocationByUserId };
