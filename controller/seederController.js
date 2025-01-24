const { faker } = require('@faker-js/faker');
const {InvitedUser} = require('../models');


const populate = ()=>{

    async function populateInvitedUsers() {
        try {
          // Generate and insert 20 dummy invited users one by one
          for (let i = 0; i < 20; i++) {
            const user = {
              type: faker.helpers.arrayElement([1, 2]),
              fullName: faker.person.fullName(),
              parentId: 2,
              birthDate: faker.date.between({ from: '2005-01-01', to: '2018-12-31' }),
              trackerDeviceId: '',
              phoneNumber: faker.phone.number('##########'),
              status: faker.helpers.arrayElement([1, 2]), // Random status: 1 or 2
            };
            
            // Create and insert user into the database
            await InvitedUser.create(user);
            // {
            //   type: 2,
            //   fullName: faker.person.fullName(),
            //   parentId: 2,
            //   birthDate: faker.date.between({ from: '2005-01-01', to: '2018-12-31' }),
            //   trackerDeviceId: '',
            //   phoneNumber: faker.phone.number('##########'),
            //   status: faker.helpers.arrayElement([1, 2]),
            // }
            console.log(`Inserted user ${i + 1}`);
          }

          console.log('All dummy invited users have been inserted successfully!');
        } catch (error) {
          console.error('Error populating InvitedUsers:', error);
        }
      }
  populateInvitedUsers();

}

module.exports = {
    populate
};