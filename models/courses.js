const mongoose = require('mongoose')

const coursesSchema = new mongoose.Schema({
    shortname: {type: String, required: true, unique: true},  // this field will be used as an unique identifier
    fullname: {type: String, required: true},
    department: {type: String, required: true},
    coordinator: {type: String, default: ""},  // FK | maps to a proctor from 'proctors' | every course must have a coordinator
    semester: Number,
    // relationship with the proctors (TEACH)
    lecturers: [String],  // FK | maps the proctors teaching the course | YET TO DECIDE WHAT TO STORE

    // relationship with the students (ENROLLED)
    students: [String],  // FK | maps the students enrolled for a course | stores the regNo of the students
    hasExam: {type: Boolean, default: false}  // cannot be edited by admin
}, {collection: 'courses'})


// method to remove a given array of students from a course
// THIS METHOD DOES NOT CHECK WHETHER THERE ARE OTHER EXAMS FOR THIS COURSE, WHICH HAS THE SAME STUDENTS AS THE DELETED EXAMS
//                                        THEREFORE PROBLEM IF THE SAME STUDENT(S) IS IN 2 EXAMS SCHEDULED FOR THE SAME COURSE.
coursesSchema.methods.removeStudents = async function (toRemove) {
    var totalRemoved = 0;
    for (let i = 0; i < toRemove.length; i++) {
        const element = toRemove[i];

        const found = await this.students.findIndex(x => x === element.regNo);  // checking whether the student is in the list of students to be removed
        // console.log({found});
        if (found >= 0) {  // found will be equal to -1 if not found
            const spliced = this.students.splice(found, 1);
            totalRemoved += 1;
            // console.log({spliced});
        }
    }
    console.log('\tRemoved ' + totalRemoved + ' students of the exam from the relevant course...');
    return totalRemoved;

}
const model = mongoose.model('coursesModel', coursesSchema)

module.exports = model