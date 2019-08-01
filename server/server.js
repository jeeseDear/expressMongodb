const express = require('express')
const newsModle = require('./models/news.js')
const userModle = require('./models/user.js')
const mongoose = require('./mongoose')
const app = new express()
const fs = require('fs')
const bodyParser = require("body-parser");
const multer = require('multer')
const md5 = require('md5')
const cookie = require('cookie-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const upload = multer({
  dest: __dirname + '/uploads'
})
// app.use(cookie())
app.use(session({
  // name: 'sessiong',
  secret: 'chyingp',  // 用来对session id相关的cookie进行签名
  // store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
  saveUninitialized: true,  // 是否自动保存未初始化的会话，建议false
  resave: true,  // 是否每次都重新保存会话，建议false
  cookie: {
      maxAge: 10 * 1000  // 有效期，单位是毫秒
  }
}));
app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(multer()); // for parsing multipart/form-data
app.get('/', function (req, res) {
  res.send({
    code: 1,
    name: 'hello world'
  })
})

// 用户登录

app.post('/signIn', async function (req, res) {
  const data = req.body
  const list = await userModle.find({'jobNumber': data.jobNumber, 'name': data.name, passport: md5(data.passport)})
  console.log('session:', req.session, req.session.user)
  if (list && list.length == 0) {
    res.send({
      msg: '无效用户',
      code: -999
    })
  } else {
    // 设置session 存储表示 user
    req.session.user = data.name
    // res.cookie('sessiong',  {jobNumber: data.jobNumber}, { expires: new Date(Date.now() + 1000000), httpOnly: true })
    res.send({
      msg: '登录成功',
      code: 1
    })
  }
})

// 用户注册

app.post('/signUp', async function (req, res) {
  const data = req.body
  const list = await userModle.find({$or: [{jobNumber: data.jobNumber}, {name: data.name}]})
  console.log(data, list)
  if (list && list.length) {
    res.send({
      msg: '此用户已被注册',
      code: -999
    })
  } else {
    const user = {
      name: data.name,
      jobNumber: data.jobNumber,
      createTime: +new Date(),
      passport: md5(data.passport)
    }
    userModle.create(user)
    res.send({
      msg: '用户创建成功',
      code: 1
    })
  }
})

app.post('/newCategory', function (req, res) {
  const data = req.body
  const addNews = {
    content: data.content,
    title: data.title,
    author: data.author,
    pic: data.filePath,
    createTime: +new Date()
  }
  newsModle.create(addNews)
  res.send({
    code: 1,
    msg: "创建成功"
  })
})

app.get('/getNewsList', async function (req, res) {
  const {pageSize, pageNum, author} = req.query
  const all = await newsModle.find()
  const list = await newsModle.find().sort({createTime: -1}).skip(Number(pageSize) * (Number(pageNum) - 1)).limit(Number(pageSize))
  res.send({
    code: 1,
    list,
    count: all.length
  })
})

app.get('/deleteNews', async function (req, res) {
  const data = req.query
  const list = await newsModle.findOneAndRemove({_id: data.id})
  console.log(list)
  res.send({
    code: 1,
    msg: '删除成功'
  })
})
// 更新
app.post('/updateNews', async function (req, res) {
  const data = req.body
  console.log(data)
  const list = await newsModle.updateOne({_id: data.id}, {$set: {title: data.title, pic: data.pic}})
  console.log('更新：', list)
  res.send({
    code: 1,
    msg: '更新成功'
  })
})

 
// 单图
app.post('/upload', upload.single('file'), async function (req, res) {
  console.log(req, '上传的图片:', req.file)
  const backAttr = req.file.mimetype.split('/')[1]
  const dateTime = new Date().getTime()
  fs.rename(req.file.path, __dirname + '/uploads/' + dateTime + '.' + backAttr, function(err) {
    if (err) {
      throw err
    }
    console.log('上传成功')
  })
 
  res.send({
    code: 1,
    msg: '上传成功',
    filePath: 'uploads/' + dateTime + '.' + backAttr
  })
})

// 多图
app.post('/multilUpload', upload.array('file', 20), async function (req, res) {
  console.log(req, '上传的图片:', req.files.length)
  const dateTime = new Date().getTime()
  let fileList = ''
  for (var i = 0; i < req.files.length; i++) {
    console.log(req.files[i])
    const backAttr = req.files[i].mimetype.split('/')[1]
    // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
    // 对临时文件转存，fs.rename(oldPath, newPath,callback);
    fileList = 'uploads/' + dateTime + '.' + backAttr
    fs.rename(req.files[i].path, __dirname + '/uploads/' + dateTime + '.' + backAttr, function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功');
    })
  }
  // const backAttr = req.file.mimetype.split('/')[1]
  // const dateTime = new Date().getTime()
  // fs.rename(req.file.path, __dirname + '/uploads/' + dateTime + '.' + backAttr, function(err) {
  //   if (err) {
  //     throw err
  //   }
  //   console.log('上传成功')
  // })
 
  res.send({
    code: 1,
    msg: '上传成功',
    filePath: fileList
  })
  res.end()
})

app.get('/uploads/*', function (req, res) {
  console.log('图片地址: ', req.url, __dirname)
  res.sendFile(__dirname + '/' + req.url)
})

app.listen('3000', function () {
  console.log('app连接3000端口')
})