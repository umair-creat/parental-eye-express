'use strict';

const { Op } = require("sequelize");
const {InvitedUser} = require("../models");

// Add a new invited user
const addOrUpdateInvitedUser = async (req, res) => {
  try {
    const { id, type, fullName, birthDate, phoneNumber } = req.body;

    // Upsert logic: create a new row or update the existing one
    const [user, created] = await InvitedUser.upsert({
      id, 
      type,
      fullName,
      parentId: req.user.id,
      birthDate,
      phoneNumber,
    });

    res.status(created ? 201 : 200).json({
      message: created
        ? 'Invited user added successfully.'
        : 'Invited user updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Error adding or updating invited user:', error);
    res.status(500).json({ error: 'Failed to add or update invited user.' });
  }
};

// Remove an invited user by ID
const removeInvitedUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await InvitedUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Invited user not found.' });
    }

    await user.destroy();

    res.status(200).json({ message: 'Invited user removed successfully.' });
  } catch (error) {
    console.error('Error removing invited user:', error);
    res.status(500).json({ error: 'Failed to remove invited user.' });
  }
};

const getAllInvitedUsers = async (req, res) => {
    try {
      const {
        search = '', 
        sortField = 'updatedAt',
        sortOrder = 'Desc',
        pageNo = 1,
        limit = 10,
        type  = 2,
      } = req.query;
  
      
      const offset = (pageNo - 1) * limit;
  
      const searchFilter = {
        [Op.or]: [
          { fullName: { [Op.iLike]: `%${search}%` } },
        ],
        [Op.and]: [
          { parentId: req.user.id },
          ...(type ? [{ type }] : []), 
        ],
      };
      
      const { count, rows } = await InvitedUser.findAndCountAll({
        where:  searchFilter ,
        order: [[sortField, sortOrder]],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });
  
      res.status(200).json({
        message: 'Fetched invited users successfully.',
        data: rows,
        
          count: count,
          pageNo: parseInt(pageNo, 10),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit, 10),
        
      });
    } catch (error) {
      console.error('Error fetching invited users:', error);
      res.status(500).json({ error: 'Failed to fetch invited users.' });
    }
  };


  const getInvitedUsersById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const row = await InvitedUser.findByPk(id);
  
      if (!row) {
        return res.status(404).json({
          message: 'Invited user not found.',
        });
      }
  
      res.status(200).json({
        message: 'Fetched invited user successfully.',
        data: row,
      });
    } catch (error) {
      console.error('Error fetching invited user:', error);
      res.status(500).json({ error: 'Failed to fetch invited user.' });
    }
  };
  
  const handdleToggleStatusById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const row = await InvitedUser.findByPk(id);
  
      if (!row) {
        return res.status(404).json({
          message: 'Invited user not found.',
        });
      }

      row.status = row.status === 1 ? 2 : 1;
      await row.save();
  
      res.status(200).json({
        message: 'Toggled invited user status successfully.',
        data: row,
      });
    } catch (error) {
      console.error('Error fetching invited user:', error);
      res.status(500).json({ error: 'Failed to fetch invited user.' });
    }
  };
  

module.exports = {
  addOrUpdateInvitedUser,
  removeInvitedUser,
  getAllInvitedUsers,
  getInvitedUsersById,
  handdleToggleStatusById,
};
