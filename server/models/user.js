const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userShema = new Schema({
  jobNumber: String,
  name: String,
  passport: String,
  createTime: Number
})
// newsShema.index({id: 1})

const user = mongoose.model('users', userShema)

module.exports = user