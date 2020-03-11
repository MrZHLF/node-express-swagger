const mogoose = require('mongoose')

const schema = new mogoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String
  },
  avatar: {
    type: String
  },
  password: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mogoose.model('User', schema)
