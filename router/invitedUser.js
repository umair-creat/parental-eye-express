const invitedUserRouter = require('express').Router();

const { removeInvitedUser, getAllInvitedUsers, getInvitedUsersById, addOrUpdateInvitedUser, handdleToggleStatusById } = require('../controller/inviteUser');
const { authenticate } = require('../middlewares/authenticate');

invitedUserRouter.post('/', authenticate, addOrUpdateInvitedUser);

invitedUserRouter.delete('/:id', authenticate, removeInvitedUser);

invitedUserRouter.get('/', authenticate, getAllInvitedUsers);

invitedUserRouter.get('/:id', authenticate, getInvitedUsersById);

invitedUserRouter.put('/:id/toggle-status', authenticate, handdleToggleStatusById);

module.exports = invitedUserRouter;