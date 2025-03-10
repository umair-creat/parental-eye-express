const { Op } = require("sequelize");
const { Device, User, InvitedUser, Location } = require("../models");
const { get } = require("../router/device");
const { deviceMap, subscribeDevice, unsubscribeDevice } = require("../helper/hiveMq");

// ✅ Create a new device
const createDevice = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    if (!name || !password ) {
      return next({ status: 400, message: "Device name and password are required" });
    }
    if(req.user.role != 1){
        return next({ status: 403, message: "You are not allowed to create a device" });
    }

    const newDevice = await Device.create({ deviceName: name, password });

    res.status(201).json({ message: "Device created successfully", device: newDevice });
  } catch (error) {
    next(error);
  }
};


const getAllDevices = async (req, res, next) => {
  try {
    const {
      search = '', 
      sortField = 'updatedAt',
      sortOrder = 'DESC',
      pageNo = 1,
      limit = 10
    } = req.query;

    const offset = (pageNo - 1) * limit;

    const searchFilter = {
      [Op.or]: [{ deviceName: { [Op.iLike]: `%${search}%` } }],
      ...(req.user.role !== 1 ? { [Op.and]: [{ parentId: req.user.id }] } : {}),
    };
    
    const { count, rows } = await Device.findAndCountAll({
      where: searchFilter,
      order: [[sortField, sortOrder]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.status(200).json({
      message: 'Fetched devices successfully.',
      data: rows,
      count,
      pageNo: parseInt(pageNo, 10),
      totalPages: Math.ceil(count / limit),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    next(error);
  }
};


// ✅ Get a single device by ID
const getDeviceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const device = await Device.findByPk(id);

    if (!device) {
      return next({ status: 404, message: "Device not found" });
    }

    res.status(200).json(device);
  } catch (error) {
    next(error);
  }
};

// ✅ Update a device
const updateDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deviceName, password, userId, parentId } = req.body;

    const device = await Device.findByPk(id);
    if (!device) {
      return next({ status: 404, message: "Device not found" });
    }

    await device.update({ deviceName, password, userId, parentId });

    res.status(200).json({ message: "Device updated successfully", device });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete a device
const deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const device = await Device.findByPk(id);
    if (!device) {
      return next({ status: 404, message: "Device not found" });
    }

    await device.destroy();

    res.status(200).json({ message: "Device deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const assignDeviceToParent = async (req, res) => {
    try {
        const { parentId, deviceId } = req.body;
      if (!parentId || !deviceId) {
        return res.status(400).json({ message: "Parent ID and Device ID are required." });
      }
  
      const parent = await User.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found." });
      }
  
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found." });
      }
  
      // Assign device to parent (assuming a `parentId` field exists in the Device model)
      device.parentId = parentId;
      await device.save();
  
      return res.status(200).json({ message: "Device assigned successfully.", device });
  
    } catch (error) {
      console.error("Error assigning device:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };


  const assignDeviceToChild = async (req, res) => {
    try {
      const { childId, deviceId } = req.body;
      
      if (!childId || !deviceId) {
        return res.status(400).json({ message: "Child ID and Device ID are required." });
      }
  
      const child = await InvitedUser.findByPk(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found." });
      }
  
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found." });
      }
  
      // Assign device to child
      device.userId = childId;
      await device.save();
  
      // Check if the device is not already subscribed
      if (!deviceMap.has(device.deviceName)) {
        deviceMap.set(device.deviceName, device.id);
        subscribeDevice(device); // Call the function to subscribe the device dynamically
        console.log(`🆕 Device ${device.deviceName} subscribed after assignment.`);
      }
  
      return res.status(200).json({ message: "Device assigned successfully.", device });
    } catch (error) {
      console.error("❌ Error assigning device:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };


  const getUnassignedChildren = async (req, res) => {
    try {
      const parentId = parseInt(req.user.id, 10);
      if (isNaN(parentId)) {
        return res.status(400).json({ success: false, message: "Invalid parentId" });
      }
  
      const invitedChildren = await InvitedUser.findAll({
        where: { parentId },
      });
  
      // Fetch all devices for the same parent
      const devices = await Device.findAll({
        where: { parentId },
        attributes: ["userId"], // Only fetch the userId column
      });
  
      // Extract assigned userIds from devices
      const assignedUserIds = devices.map((device) => device.userId).filter(Boolean);
  
      // Filter out children who are already assigned a device
      const unassignedChildren = invitedChildren.filter(
        (child) => !assignedUserIds.includes(child.id)
      );
  
      return res.status(200).json({ success: true, data: unassignedChildren });
    } catch (error) {
      console.error("Error fetching unassigned children:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  const unassignDeviceFromParent = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: "Device ID is required." });
      }
  
      const device = await Device.findByPk(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found." });
      }
      await Location.destroy({
        where: { device_id: device.id },
      });
  
      if (deviceMap.has(device.deviceName)) {
        unsubscribeDevice(device.deviceName); // Call function to unsubscribe
        deviceMap.delete(device.deviceName);
        console.log(`🛑 Stopped listening for ${device.deviceName}`);
      }
      
      // Unassign the parent by setting parentId to null
      device.parentId = null;
      device.userId = null;
      await device.save();
  
      return res.status(200).json({ message: "Device unassigned from parent successfully.", device });
  
    } catch (error) {
      console.error("Error unassigning device from parent:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  const unassignDeviceFromChild = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: "Device ID is required." });
      }
  
      const device = await Device.findByPk(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found." });
      }
      await Location.destroy({
        where: { device_id: device.id },
      });
  
      // Unassign the child by setting userId to null
      device.userId = null;
      await device.save();
  
      // Remove the device from the deviceMap and stop listening
      if (deviceMap.has(device.deviceName)) {
        unsubscribeDevice(device.deviceName); // Call function to unsubscribe
        deviceMap.delete(device.deviceName);
        console.log(`🛑 Stopped listening for ${device.deviceName}`);
      }
  
      return res.status(200).json({ message: "Device unassigned from child successfully.", device });
  
    } catch (error) {
      console.error("❌ Error unassigning device from child:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
  
  
  
  

module.exports = {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
    assignDeviceToParent,
    assignDeviceToChild,
    getUnassignedChildren,
    unassignDeviceFromParent,
    unassignDeviceFromChild,

};
