const mongoose = require('mongoose')
const exam_rooms = require('./exam_rooms');  // importing the mongoose model for the collection 'exam_rooms'
const courses = require('./courses');

const examsSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    // date: {type: Date, default: Date.now},
    startTime: {type: Date, required: true},  // it is a must that a exam has a start time
    duration: String,  // end time can be optional (start time + duration)
    course_coordinator: String,
    chief_invigilators: [{exam_room: String, name: String, email: String}],
    invigilators: [{exam_room: String, name: String, email: String}],
    total_students: Number,
    students: [{regNo: String, eligible: Boolean, exam_room: String}],

    // relationship with the courses (HAS)
    course: String  // FK | maps to the correponding course

}, {collection: 'exams'})


/**
 * 
 * static function that will be called to create relevant exam rooms when admin creates an exam
 * argument info = {students: list of "students", distinct_exam_rooms: [A, B, ..], name: "E20 Mock Exam", chief_invigilators: [{exam_room: "", name: name of the CI}, {}, ...], invigilators: [{exam_room: "", name: name of the CI}, {}, ...]}
 */
examsSchema.statics.addExamRooms = function(info) {  // HAVE TO HANDLE ERRORS
    const exam = info.name;
    var errorOccured = false;
    // var room_name;
    // var room_students = [];

    // students: [{regNo: String, participation: Boolean, joined_at: Date}] 
    // exams.addExamRooms({distinct_exam_rooms, name, students, chief_invigilators, invigilators});
    // students.push({regNo, eligible, exam_room});
    var itrCount = 0;
    info.distinct_exam_rooms.forEach(room => {  // loops once for each distinct exam room, room = --> A, B, C, ...
        // if(errorOccured)
        //     break;
        var room_name = exam + ' room ' + room;  // CHANGE THE FORMAT OF THE ROOM NAME
        var room_students = [];

        // getting the the video upload link from the function argument
        var recordedStudentVideosAt = info.recordedStudentVideosAt.find(obj => obj.exam_room === room).link;
        // getting the chief invigilator and the invigilator from the function argument
        var chief_invigilator = info.chief_invigilators.find(obj => obj.exam_room === room).name;
        var invigilator = info.invigilators.find(obj => obj.exam_room === room).name;

        info.students.forEach(student => {  // loops once for each student, will check all the students for all the exams
            if(student.exam_room == room){
                var tempStudent = {
                    regNo: student.regNo,
                    participation: false
                };
                room_students.push(tempStudent);  // adds student if his/her room is this room
            }
        });

        // PROBLEM IF THE PROGRAM EXECUTES THE FOLLOWING BEFORE COMPLETING THE PREVIOUS
        
        const newExamRoom = new exam_rooms({exam, room_name, room_students, chief_invigilator, invigilator, recordedStudentVideosAt});

        newExamRoom.save()  // waiting until the exam room finishes creating 
        .then(() => {
            // console.log('Created new exam_room: ' + newExamRoom);
            // console.log();
            // return true;
            itrCount += 1;
            if(itrCount >= info.distinct_exam_rooms.length) {  // does not work for now --> TRY TO MAKE THIS WORK
                return true;
            }
        })
        .catch(err => {
            // res.status(400).json({status: 'failure', message: 'Following error occured when trying to make an exam room', error: err});
            console.log('Error occured trying to make exam room: \n' + err);
            return false;
            // errorOccured = true;
        });
            
    });
    // return true;
};

/**
 * 
 * function to update the courses collection when adding an exam 
 * will update the course coordinator IF the course doesn't already have a coordinator
 * will add the students who are are not already in the students list of the course
 * argument info = {course: "shortname" of the course, students: list of "students", course_coordinator: "coordinator" of the course}
 */
examsSchema.statics.updateExamOnCourses = function(info) { 
    const shortname = info.course;
    // const students = info.students;
    // const coordinator = info.course_coordinator;
    // console.log("\n\n\n\nshortname: " + shortname + '\n\n\n');
    courses.findOne({shortname})
    .then(result => {
        if(result.coordinator == "")  // updating the courses coordinator of there isn't one already
            result.coordinator = info.course_coordinator;
        if(result.hasExam == false)
            result.hasExam = true;
        info.students.forEach(newStudent => {  // checking each student of the new exam in the list of students in the course
            if(result.students.find(exstStudent => exstStudent == newStudent.regNo) == null) 
                result.students.push(newStudent.regNo);  // adding the student if he/she is not already in the courses list
        });
        
        result.save()
        .then(() => {
            console.log("\tUpdated the courses collections " + shortname + "-->\n\t\tchecked and updated the course coordinator\n\t\tadded the new students to the course\n\t\thasExam set to true");
            return true;
        })
        .catch(err => {
            console.log("Error occured while trying to update the courses according to the new exam:\n" + err);
            return false;
        });
    })
    .catch(err => {
        console.log("Error occured while trying to find the course to update after creating new exam:\n" + err);
        return false;
    });
};
const model = mongoose.model('examsModel', examsSchema)

module.exports = model