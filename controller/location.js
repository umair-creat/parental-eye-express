

const { Op } = require("sequelize");
const { User, InvitedUser, Device, Location } = require("../models");

const getUsersWithLocationHistory = async (req, res) => {
  try {
    // Find all device IDs that exist in the Location table
    const devicesWithLocation = await Location.findAll({
      attributes: ["device_id"],
      group: ["device_id"], // Ensures unique device IDs
    });

    const deviceIds = devicesWithLocation.map((loc) => loc.device_id);

    if (deviceIds.length === 0) {
      return res.status(404).json({ message: "No users with location history found." });
    }

    // Find all users who have these devices
    const users = await Device.findAll({
      where: { id: deviceIds },
      include: [
        {
          model: InvitedUser,
          as: "user",
          attributes: ["id", "fullName", "phoneNumber", "status"],
        },
      ],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users with location history:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getLocationByUserId = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    console.log(`Fetching locations for UserID: ${userId} from ${startDate} to ${endDate}`);

    const device = await Device.findOne({ where: { userId } });
    if (!device) return res.status(404).json({ message: "Device not found for this user" });

    const location = await Location.findAll({
      where: {
        device_id: device.id,
        received_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      order: [["received_at", "DESC"]],
    });

    if (!location.length) return res.status(404).json({ message: "No location data available" });

    return res.status(200).json({ deviceId: device.id, location });
  } catch (error) {
    console.error("Error fetching location:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { getLocationByUserId, getUsersWithLocationHistory };
