const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Data we need to collect/confirm to have the app go.
const fields = {
  email: {
    type: String
  },
  space: {
    type: String
  }
}

// One nice, clean line to create the Schema.
const userSchema = new Schema(fields)

module.exports = mongoose.model('User', userSchema)