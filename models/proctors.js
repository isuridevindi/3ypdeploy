const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const proctorsSchema = new mongoose.Schema({
    name: {type: String, required: true},  // used as the PK for now | must change PK to email
    email: {type: String, required: true, unique: true},
    password: {type: String, default: '', select: false},
    isRegistered: {type: Boolean, default: false},
    department: {type: String, default: ''},
    recentExam: {type: String, default:'No exams yet'},
    profile_picture: {type: String, default: 'No profile picture'}
    
}, {collection: 'proctors'})

// const model = mongoose.model('proctorsModel', proctorsSchema)


proctorsSchema.methods.matchPasswords = async function(enteredPassword) {
    // console.log();
    // var isMatch = false;
    // bcrypt.compare(enteredPassword, this.password, function(err, result) {
    //     console.log('inside matchPasswords: ' + result);
    //     cb(result);
    //     // cb(result);  // true if passwords match, else false
    //     // isMatch = result;   
    // });
    // return isMatch;
    const isMatch =  await bcrypt.compare(enteredPassword, this.password);  // AWAIT WORKS
    // console.log(isMatch);
    return isMatch;
}

proctorsSchema.methods.getSignedToken = function(cb) {
    // signing a JWT token with the user _id
    // uses the HS256 algorithm to sign
    // uses the use id as the payload
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_STUDENT, {expiresIn: process.env.JWT_EXPIRE_STUDENT});
}


const model = mongoose.model('proctorsModel', proctorsSchema)
module.exports = model

