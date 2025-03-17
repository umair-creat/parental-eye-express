const { Sequelize } = require("sequelize");
const { Geofence, GeofenceDevice, Device, User } = require("../models");

// ✅ Get all geofences (Only those with linked devices)
const getAllGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.findAll({
      include: [
        {
          model: Device,
          as: "devices",
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "email"],
        },
      ],

    });

    res.json(geofences);
  } catch (error) {
    console.error("Error fetching geofences:", error);
    res.status(500).json({ error: "Failed to retrieve geofences" });
  }
};
const createGeofence = async (req, res) => {
    try {
      const { name, type, area, path, center, radius, status } = req.body;
  
      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required." });
      }
      const created_by = req.user.id;
  
      // Validate and convert GeoJSON fields
      const areaGeom = area ? Sequelize.fn("ST_GeomFromGeoJSON", JSON.stringify(area)) : null;
      const pathGeom = path ? Sequelize.fn("ST_GeomFromGeoJSON", JSON.stringify(path)) : null;
  
      // Ensure center is a valid GeoJSON Point
      let centerGeom = null;
      if (center && center.type === "Point" && Array.isArray(center.coordinates)) {
        centerGeom = Sequelize.fn("ST_GeomFromGeoJSON", JSON.stringify(center));
      }
  
      // Create the geofence
      const newGeofence = await Geofence.create({
        name,
        type,
        area: areaGeom,
        path: pathGeom,
        center: centerGeom,
        radius,
        status,
        created_by,
      });
  
      res.status(201).json({ message: "Geofence created successfully", geofence: newGeofence });
    } catch (error) {
      console.error("Error creating geofence:", error);
      res.status(500).json({ error: "Failed to create geofence" });
    }
  };
module.exports = { getAllGeofences, createGeofence };
