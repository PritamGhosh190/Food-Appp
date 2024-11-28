const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
  name: String,
  authButton: {
    type: Schema.Types.ObjectId,
    ref: 'AuthButton'
  }
})

module.exports = model('Role', roleSchema)