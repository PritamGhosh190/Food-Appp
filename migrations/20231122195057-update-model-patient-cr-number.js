module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('patients').updateMany(
      {
        cr_number: {
          $type: 16, //type double https://www.mongodb.com/docs/manual/reference/operator/aggregation/type/#available-types
        },
      },
      [
        {
          $set: {
            cr_number: {
              $toString: "$cr_number",
            },
          },
        },
      ]
    )
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});

    await db.collection('patients').updateMany(
      {
        cr_number: {
          $type: 2, //type string
        }
      },
      [
        {
          $set: {
            "cr_number": {
              $toInt: "$cr_number",
            }
          }
        }
      ]
    );

  }
};
