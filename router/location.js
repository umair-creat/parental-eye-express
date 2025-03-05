const { getLocationByUserId, getUsersWithLocationHistory } = require('../controller/location');
const { authenticate } = require('../middlewares/authenticate');

const locationRouter = require('express').Router();

locationRouter.post('/', authenticate,getLocationByUserId);
locationRouter.get('/', authenticate, getUsersWithLocationHistory)

module.exports = locationRouter;