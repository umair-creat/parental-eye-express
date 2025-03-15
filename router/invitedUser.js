const invitedUserRouter = require('express').Router();


const { addOrUpdateUser, removeUser, getAllUsers, getUserById, getAllParents, getAllDrivers } = require('../controller/inviteUser');
const { authenticate } = require('../middlewares/authenticate');

invitedUserRouter.post('/', authenticate, addOrUpdateUser);

invitedUserRouter.get('/', authenticate, getAllUsers);
invitedUserRouter.get('/parent', authenticate, getAllParents);
invitedUserRouter.get('/driver', authenticate, getAllDrivers);

invitedUserRouter.delete('/:id', authenticate, removeUser);

invitedUserRouter.get('/:id', authenticate, getUserById);


module.exports = invitedUserRouter;