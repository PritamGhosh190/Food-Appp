const {Schema, model} = require('mongoose')

const menuSchema = new Schema({
  path: String,
  element: String,
  meta: {
    key: String,
    title: String,
    icon: String,
    isLink: String,
    isHide: Boolean,
    isFull: Boolean,
    isAffix: Boolean,
  },
  role: [{
    type: Schema.Types.String,
    ref: 'Role',
  }],
  children: Schema.Types.Mixed
})

module.exports = model('Menu', menuSchema)