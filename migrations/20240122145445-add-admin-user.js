module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('users').insertOne({
      "name": "Admin",
      "username": "admin",
      "email": "admin@example.com",
      "password": "$2a$12$AVLLiaRMJA0MasChklvZme2nBMTzvQQ0tHOzSeNBMeJMpbPLuQqbC", //admin123
      "role": "admin",
      "is_active": true,
      "is_deleted": false,
    });
  },
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
      // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
      
    await db.collections('users').deleteOne({
      "username": "admin",
    });
  }
};
