const mongoose = require('mongoose')

const exam_roomsSchema = new mongoose.Schema({
    room_name: {type: String, required: true, unique:  true},

    // can get the following details from the corresponding exam //////////////////////////////////////////////////////////////////////////////////////////////////////////
    // startTime: {type: Date, required: true},  // it is a must that a exam has a start time
    // endTime: Date,  // end time can be optional
    // room_name: {type: String, default: this.name},

    // relationship with the proctors (PROCTORS)
    // proctor_incharge: {type: String, required: true},  // FK | every exam room must have a proctor incharge. // stores the _id from the 'proctors' collection
    // proctors: [{procID: String, role: String}],  // FK | maps the other proctors joining the exam room | has multiple proctors
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // relationship with the exams (HAS)
    
    exam: {type: String, required: true},  // FK | stores the _id of the corresponding exam

    // relationship with the students (JOINS)
    // participation will be set to false during room creation
    // update to true when the student joins the room and also update joined_at
    room_students: [{regNo: String, participation: {type: Boolean, default: false}, disconnections: [{type: String, default: ['no disconnections']}], joined_at: Date}],  // FK | maps the students joining an exam room | has multiple students
    chief_invigilator: String,
    invigilator: String,
    recordedStudentVideosAt: String
}, {collection: 'exam_rooms'})

const model = mongoose.model('exam_roomsModel', exam_roomsSchema)

module.exports = model