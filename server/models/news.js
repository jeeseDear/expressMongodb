const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsShema = new Schema({
  id: Number,
  content: String,
  title: String,
  pic: String,
  createTime: Number,
  author: String
})
newsShema.index({createTime: 1, type: -1})
// newsShema.createIndex({id: 1})
const news = mongoose.model('news', newsShema)

module.exports = news