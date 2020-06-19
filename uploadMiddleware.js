const multer = require("multer");
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const sanitize = require('sanitize-filename')

const UPLOAD_PATH = path.resolve(__dirname, './static/images/upload')

const storage = multer.memoryStorage()
const multerMiddleware = multer({ storage }).fields([{ name: 'image' }])
console.log("middl")
const uploadMiddleWare = (req, res, next) => {
  multerMiddleware(req, res, () => {
    // request contains file data in req.files in format
    // {
    //   key: [{
    //     fieldname,
    //     originalname,
    //     encoding,
    //     mimetype,
    //     buffer,
    //     size
    //   }]
    // }

    // convert to array in format
    // [
    //   [fieldname, originalname ...]
    // ]
    console.log("req", req.files)
    const files = _.values(req.files)
console.log("files", files)
    if (!files || files.length === 0) {
      // eslint-disable-next-line no-undef
      log('upload middleware: no files')
      next()
      return
    }

    // Parse variables so we can add to them
    // (express-graphql won't parse them again once populated)
    req.body.variables = JSON.parse(req.body.variables)

    files.forEach((fileArray) => {
      const file = fileArray[0]

      // add hash to sanitized file name
      const filename = `${Date.now()}_${sanitize(
        file.originalname.replace(
          /[`~!@#$%^&*()_|+\-=÷¿?;:'",<>{}[]\\\/]/gi,
          '',
        ),
      )}`

      // save file to disk
      const filePath = path.join(
        UPLOAD_PATH,
        filename,
      )
      fs.writeFileSync(filePath, file.buffer)

      // Add files to graphql input. We only support single images here.
      // In our case the image field for the CreatePostMutation is populated
      // with the uploaded images URL
      req.body.variables.input[file.fieldname] = `/images/upload/${filename}`

      // eslint-disable-next-line no-undef
      log(`upload middleware: uploaded file ${file.originalname} to ${req.body.variables.input[file.fieldname]}`)
    })

    next()
  })
}

module.exports = {uploadMiddleWare}
