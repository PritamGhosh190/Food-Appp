const {Schema, model} = require('mongoose')

const authButtonSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  buttonsList: {
    type: Array,
    name: String,
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
  },
})

module.exports = model('AuthButton', authButtonSchema)
