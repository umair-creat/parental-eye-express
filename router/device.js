const deviceRouter = require('express').Router();
const { createDevice, getAllDevices, getDeviceById, updateDevice, deleteDevice, assignDeviceToParent, assignDeviceToChild, getUnassignedChildren, unassignDeviceFromParent, unassignDeviceFromChild } = require('../controller/device');
const { authenticate } = require('../middlewares/authenticate');

deviceRouter.post("/", authenticate,createDevice);
deviceRouter.get("/", authenticate, getAllDevices);
deviceRouter.get("/unassigned-child", authenticate, getUnassignedChildren);
deviceRouter.get("/:id", authenticate, getDeviceById);
deviceRouter.put("/:id", authenticate, updateDevice);
deviceRouter.delete("/:id", authenticate, deleteDevice);
deviceRouter.post("/update-status", authenticate, assignDeviceToParent);
deviceRouter.post("/assign-child", authenticate, assignDeviceToChild);
deviceRouter.put("/unassign-parent/:id", authenticate, unassignDeviceFromParent);
deviceRouter.put("/unassign-child/:id", authenticate, unassignDeviceFromChild);


module.exports = deviceRouter;