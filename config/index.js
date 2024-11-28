require('dotenv').config()

module.exports = {
  SECRET: process.env.SECRET,
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION,
  REQUEST_TIMEOUT: process.env.REQUEST_TIMEOUT,
  MONGO_HOST: process.env.MONGOHOST,
  MONGO_URL: process.env.MONGO_URL,
  MONGO_PORT: process.env.MONGOPORT,
  MONGO_USER: process.env.MONGOUSER,
  MONGO_PASSWORD: process.env.MONGOPASSWORD,
  MONGO_DB_NAME: process.env.MONGODBNAME,
  NODE_PORT: process.env.PORT,
}
