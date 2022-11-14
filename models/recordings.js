const mongoose = require('mongoose')

const recordingsSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},

    // relationship with the exam rooms (FROM)
    exam_room: String,  // FK | maps the exam room of the recording

    // relationship with the students (OF)
    student: String  // FK | maps the student of the recording
    
}, {collection: 'recordings'})

const model = mongoose.model('recordingsModel', recordingsSchema)

module.exports = model