const { error } = require('console');
const crypto = require('crypto');
const multer = require('multer');
var path = require('path');


// set storage engine to store admin/proctor/student profile pictures
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/profile_pictures'),  // '../public/profile_pictures',
    filename: function(req, file, cb){
      crypto.randomBytes(16, (err, buf) => {
        if(err) {
          console.log("Error occured trying to create crypto.randomBytes: " + err);
          return rejects(err);  // ERROR MIGHT HAPPEN HERE
        }
        cb(null, buf.toString('hex') + '-' + Date.now() + path.extname(file.originalname));
      });
    
    }
  });
  
  // init upload
  const upload = multer({
    storage: storage
  }).single('profile_picture');
  
  module.exports = upload;
  
  ////////////////////////////////////////////////////////////////////