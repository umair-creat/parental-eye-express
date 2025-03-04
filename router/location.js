const { getLocationByUserId } = require('../controller/location');
const { authenticate } = require('../middlewares/authenticate');

const locationRouter = require('express').Router();

locationRouter.post('/', authenticate,getLocationByUserId);

module.exports = locationRouter;