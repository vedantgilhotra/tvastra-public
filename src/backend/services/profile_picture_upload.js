var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
const dotenv = require("dotenv");
dotenv.config({path: "../../config/config.env"});
aws.config.update({
    secretAccessKey:process.env.SECRET_ACCESS_KEY,
    accessKeyId:process.env.ACCESS_KEY_ID,
    region:process.env.REGION
});

var s3 = new aws.S3();
 
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'tvastra-profile-pictures',
    acl:'public-read',
    contentType:multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      console.log(file);
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
});

module.exports = {
    upload:upload
}