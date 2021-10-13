const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// importing the mongoose models ///////////////////////////////////////////////////////////////////////////////

const proctors = require('../../models/proctors');  // importing the mongoose model for the collection 'proctors'
const students = require('../../models/students');  // importing the mongoose model for the collection 'students'
const recordings = require('../../models/recordings');  // importing the mongoose model for the collection 'recordings'

////////// student accessible collections

const courses = require('../../models/courses');  // importing the mongoose model for the collection 'courses'
const exams = require('../../models/exams');  // importing the mongoose model for the collection 'exams'
const exam_rooms = require('../../models/exam_rooms');  // importing the mongoose model for the collection 'exam_rooms'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { protectProctor } = require('../../middleware/proctorAuth');

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////
// // APIs for the registration page
// // add new user to the database
// router.post('/register', (req, res) => {
//     // method to add a new entry to the user relation in the database
//     /**
//      * write code to add user to the database
//      * there has to be 2 pages to redirect
//      *          1. page to enter the authentication pin
//      *          2. another page if the user already exists
//      */

//     // redirecting to the login page after a successful registration
//     res.redirect('/*path of the page to redirect to after regitering */'); 
// });

// // check whether the pin given at registration
// // POST METHOD?
// router.get('/checkpin', (req, res) => {
//     /**
//      * send the pin generated and stored in the database (where? idk)
//      * UI calls this method after user enters pin, and compares the API sent key with the user entered key
//      */
//     res.json(/**array containing the pin as an object */);
// });
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

/**
 * API calls for registration
 * proctor emails and detailt will be added by the admin
 * when procor tries to register --> check DB for given email
 * if email exists --> proctor can add a password of his/her choice.
 * proctor setting a password is considered as registering
 */

// API call to register proctor
router.post('/register', (req, res) => {
    const {email, password0, password1} = req.body;

    // let errors = [];

    // checking of required fields is done by the frontend

    // checking this just incase because suri is dumb
    if(password0 != password1) {
        // errors.push({msg: 'Passwords do not match'});
        res.status(400).json({status: 'failure', message: 'Entered passwords do not match'})  // CHECK THE STATUS CODE
    }
    else {
        // validation passed
        proctors.findOne({email}).select('+password')   // finds the proctor by email
        .then(proctor => {
            if(proctor) {  // given email exists as a proctor
                // checks whether the email is set or not. to check whether the proctor has already registered or not
                if(proctor.password == '') {  // proctor not yet register
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password0, salt, (err, hash) => {
                            if(err) throw err;  // HANDLE WHAT HAPPENS HERE
                            // setting proctor's password to hashed value
                            proctor.password = hash;
                            // saving the proctor with the new password hash
                            proctor.save()
                            .then(() => {
                                // success
                                res.json({status: 'success', message: 'Proctor is now registered'});
                            })
                            .catch(err => {
                                res.status(400).json({status: 'failure', message: 'Error occured while trying to save the password hash', error: String(err)})  // CHECK THE STATUS CODE
                            }); 
                        })
                    })
                }
                else {  // proctor has already registered
                    res.status(400).json({status: 'failure', message: 'Proctor has already been registered'})  // CHECK THE STATUS CODE
                }

            }
            else {  // no user with the given email is entered as a proctor by the admin
                res.status(400).json({status: 'failure', message: 'The email has not been assigned as a proctor by the admin'})  // CHECK THE STATUS CODE
            }
        })
        .catch(err => {
            res.status(400).json({status: 'failure', message: 'Error occured while trying to find the proctor with the given email', error: String(err)})  // CHECK THE STATUS CODE
        });
    }

});

// API call to login proctor
router.post('/login', (req, res) => {
    // frontend does email password field validations
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password){
        return res.status(400).json({status: 'failure', message: 'Enter both email and password fields'})
    }
    // try{
    proctors.findOne({ email }).select("+password")  
    .then(async proctor => {
        // console.log(proctor);
        if(!proctor){
            return res.status(404).json({status: 'failure', message: "Email does not exist"});
        }
        else if(proctor.password == '') {  // to check if the user has not yet registered
            return res.status(400).json({status: 'failure', message: "Proctor has not registered"});
        }
        
        try {
            const isMatch = await proctor.matchPasswords(password);  // AWAIT WORKS
            // console.log(isMatch);

            if(!isMatch){
                return res.status(405).json({status: 'failure', message: "Invalid credentials"});
            }
            // password match
            // login successful
            // sending token to proctor
            const token = await proctor.getSignedToken();  // AWAIT WORKS
            // console.log(token);
            // sending the token to the user
            res.json({status: 'success', token});

        }catch(err) {
            res.status(406).json({status: 'failure', message:'Error occured', error: err.message});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({status: 'failure', message: 'Error occured while trying to find the proctor by given email', error: err})
    });
    
    // }catch(error){
    //     res.status(406).json({status: 'failure', error: error.message});
    // }

});




////////////////////////////////////////////////////////////////////////////////////////////////////////
// APIs for the Home page


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

/**
 * API calls to the exams collection
 * proctor can only read exams
 * proctor can only read scheduled exams which he/she proctors
 */

// to get acheduled exams relevant to the proctor
// response --> {chief_invigilating_exams: [[{exam_room}, {exam}], [], ..., []], invigilating_exams: [[{exam_room}, {exam}], [], ..., []]}
router.get('/exams/self', protectProctor, (req, res) => {
    proctors.findById(req.proctor.id)
    .then(async result1 => {
        // const StudentRegNo = result1.regNo;
        const chief_invigilating_exams = [];
        const invigilating_exams = [];
        // const tempArray = [];

        //////// getting the chief invigilating rooms
        await exam_rooms.find({chief_invigilator: result1.name})
        .then(async result2 => {
            // const retArray = [];
            // const tempArray = [];
            result2.forEach(room => {
                var tempArray = [];
                tempArray.push(room);
                exams.findOne({name: room.exam})
                .then(result3 => {
                    tempArray.push(result3);
                    // adding the array [exam_room, exam] as an element to the returning array
                    chief_invigilating_exams.push(tempArray);
                    // clearing the tempArray for the next iteration
                    tempArray = [];

                })
                .catch(err => {
                    console.log("Error occured while trying to find the exam of the given exam_room (chief invigilating)");
                    // returns from the entire API call sending the error as the response
                    return res.json({status: failure, message: 'Error occured while trying to find the exam of the given exam_room (chief invigilating)', error: String(err)});
                });
                // // adding the array [exam_room, exam] as an element to the returning array
                // chief_invigilating_exams.push(tempArray);
                // // clearing the tempArray for the next iteration
                // tempArray = [];
            });
            // res.json(retArray);
        })
        .catch(err => {
            console.log("Error occured while trying to find the exam_rooms for the given proctor name (chief invigilating)");
            res.json({status: 'failure', message: 'Error occured while trying to find the exam_rooms for the given proctor name (chief invigilating)', error: String(err)});
        });

        //////// getting the invigilating rooms
        await exam_rooms.find({invigilator: result1.name})
        .then(result2 => {
            // const retArray = [];
            // const tempArray = [];
            
            tempArray = [];  // not necessary
            result2.forEach(room => {
                var tempArray = [];
                tempArray.push(room);
                exams.findOne({name: room.exam})
                .then(result3 => {
                    tempArray.push(result3);
                    // adding the array [exam_room, exam] as an element to the returning array
                    invigilating_exams.push(tempArray);
                    // clearing the tempArray for the next iteration
                    tempArray = [];
                })
                .catch(err => {
                    console.log("Error occured while trying to find the exam of the given exam_room (invigilating)");
                    // returns from the entire API call sending the error as the response
                    return res.json({status: failure, message: 'Error occured while trying to find the exam of the given exam_room (invigilating)', error: String(err)});
                });
                // // adding the array [exam_room, exam] as an element to the returning array
                // invigilating_exams.push(tempArray);
                // // clearing the tempArray for the next iteration
                // tempArray = [];
            });
            // res.json(retArray);
        })
        .catch(err => {
            console.log("Error occured while trying to find the exam_rooms for the given proctor name (invigilating)");
            res.json({status: 'failure', message: 'Error occured while trying to find the exam_rooms for the given proctor name (invigilating)', error: String(err)});
        });

        // sending the succeess response to the user
        res.json({chief_invigilating_exams, invigilating_exams});

    })
    .catch(err => {
        console.log("Error occured while trying to find the proctor name from given ID");
        res.json({status: 'failure', message: 'Error occured while trying to find the proctor name from given ID', error: String(err)});
    });
});


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


/**
 * API calls to the courses collection
 */
// // to get the recently accessed courses
// router.get('/recentcourses', (req, res) => {
//     /**
//      * get the recently accessed courses from the database  
//      */
//      res.json(/**array containing the courses as objects*/);
// });

// call to read all courses
router.get('/courses/all', (req, res) => {
    // const req_body = req.body;
    // console.log('Request body: ' + req_body);

    // const records = await admins.find(req_body);
    // console.log('Sending response: ' + records);

    courses.find()
    .then(result => res.json(result))
    .catch(err => res.status(400).json({status: 'failure', message: 'Following error occured while trying to read all the courses', error: String(err) }));
});

// call to get courses which have scheduled exams to be invigilators
// response --> {chief_invigilating_courses: [], invigilating_courses: []}
router.get('/courses/self', protectProctor, (req, res) => {
    proctors.findById(req.proctor.id)
    .then(async result1 => {
        // const StudentRegNo = result1.regNo;
        const chief_invigilating_courses = [];
        const invigilating_courses = [];
        // const tempArray = [];

        //////// getting the chief invigilating rooms
        await exam_rooms.find({chief_invigilator: result1.name})
        .then(async result2 => {
            // const retArray = [];
            // const tempArray = [];
            result2.forEach(room => {
                // var tempArray = [];
                // tempArray.push(room);
                exams.findOne({name: room.exam})
                .then(result3 => {
                    // tempArray.push(result3);
                    // adding the array [exam_room, exam] as an element to the returning array
                    chief_invigilating_courses.push(result3.course);
                    // clearing the tempArray for the next iteration
                    // tempArray = [];

                })
                .catch(err => {
                    console.log("Error occured while trying to find the exam of the given exam_room (chief invigilating)");
                    // returns from the entire API call sending the error as the response
                    return res.status(400).json({status: failure, message: 'Error occured while trying to find the exam of the given exam_room (chief invigilating)', error: String(err)});
                });
                // // adding the array [exam_room, exam] as an element to the returning array
                // chief_invigilating_exams.push(tempArray);
                // // clearing the tempArray for the next iteration
                // tempArray = [];
            });
            // res.json(retArray);
        })
        .catch(err => {
            console.log("Error occured while trying to find the exam_rooms for the given proctor name (chief invigilating)");
            res.status(400).json({status: 'failure', message: 'Error occured while trying to find the exam_rooms for the given proctor name (chief invigilating)', error: String(err)});
        });

        //////// getting the invigilating rooms
        await exam_rooms.find({invigilator: result1.name})
        .then(result2 => {
            // const retArray = [];
            // const tempArray = [];
            
            // tempArray = [];  // not necessary
            result2.forEach(room => {
                // var tempArray = [];
                // tempArray.push(room);
                exams.findOne({name: room.exam})
                .then(result3 => {
                    // tempArray.push(result3);
                    // adding the array [exam_room, exam] as an element to the returning array
                    invigilating_courses.push(tempArray);
                    // clearing the tempArray for the next iteration
                    // tempArray = [];
                })
                .catch(err => {
                    console.log("Error occured while trying to find the exam of the given exam_room (invigilating)");
                    // returns from the entire API call sending the error as the response
                    return res.status(400).json({status: failure, message: 'Error occured while trying to find the exam of the given exam_room (invigilating)', error: String(err)});
                });
                // // adding the array [exam_room, exam] as an element to the returning array
                // invigilating_exams.push(tempArray);
                // // clearing the tempArray for the next iteration
                // tempArray = [];
            });
            // res.json(retArray);
        })
        .catch(err => {
            console.log("Error occured while trying to find the exam_rooms for the given proctor name (invigilating)");
            res.status(400).json({status: 'failure', message: 'Error occured while trying to find the exam_rooms for the given proctor name (invigilating)', error: String(err)});
        });

        // sending the succeess response to the user
        res.json({chief_invigilating_courses, invigilating_courses});

    })
    .catch(err => {
        console.log("Error occured while trying to find the proctor name from given ID");
        res.status(400).json({status: 'failure', message: 'Error occured while trying to find the proctor name from given ID', error: String(err)});
    });
});

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

// ////////////////////////////////////////////////////////////////////////////////////////////////////////
// // APIs for the Dashboard page

// // to get the next up coming exam
// router.get('/nextexam', (req, res) => {
//     /**
//      * get the next exam from the database (based on the scheduled date)
//      */
//     res.json(/**array containg a single object relevant to the nxt upcoming exam */);
// });

// // to get recently held exams
// router.get('/recentexams', (req, res) => {
//     /**
//      * to get the recently finished exams
//      */
// });


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


/**
 * API calls to the proctors collection
 */

// to read own student data (SELF)
router.get('/proctors/self', protectProctor, (req, res) => {
    // const req_body = req.body;
    // console.log('Request body: ' + req_body);

    // const records = await admins.find(req_body);
    // console.log('Sending response: ' + records);

    res.json(req.proctor)
    // proctors.findById(req.params.id)
    // .then(result => res.json(result))
    // .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find the proctor from given ID', error: String(err)}));
});

// API call to update self info
router.put('/proctors/self', protectProctor, (req, res) => {
    proctors.findById(req.proctor.id)
    .then(proctor => {
        proctor.name = req.body.name;
        proctor.email = req.body.email;

        proctor.save()
        .then(() => res.json({status: 'success', message: 'Updated the proctor info', updatedEntry: proctor}))
        .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to save the updated entry', error: String(err)}));
    })
    .catch(err => res.status(400).json({status: 'failure', message: "Error occured while trying to read self proctor record", error: String(err)}));
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
