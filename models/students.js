const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    regNo: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},  // student names and emails are required
    password: {type: String, default: '', select: false},
    isRegistered: {type: Boolean, default: false},
    department: {type: String, default: ''},
    // relationship with the devices (HAS)
    device: {type: String, default: 'No device given'},  // FK | maps to the device that the student has
    profile_picture: {type: String, default: 'No profile picture'}

}, {collection: 'students'})


studentsSchema.methods.matchPasswords = async function(enteredPassword) {
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

studentsSchema.methods.getSignedToken = function(cb) {
    // signing a JWT token with the user _id
    // uses the HS256 algorithm to sign
    // uses the use id as the payload
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_STUDENT, {expiresIn: process.env.JWT_EXPIRE_STUDENT});
}


const model = mongoose.model('studentsModel', studentsSchema)

module.exports = model