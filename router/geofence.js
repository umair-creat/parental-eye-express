const express = require("express");
const { getAllGeofences, createGeofence, deleteGeofence } = require("../controller/geofence");
const { authenticate } = require("../middlewares/authenticate");
const geofenceRouter = express.Router();


// Get all geofences
geofenceRouter.get("/", authenticate, getAllGeofences);

// Create a geofence
geofenceRouter.post("/", authenticate, createGeofence);


module.exports = geofenceRouter;
