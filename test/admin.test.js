const request = require('supertest');
const { response } = require('../app');
const app = require('../app');

var auth = {};
///////

// before each request, create a user and log them in
// beforeEach(async () => {
//     // const hashedPassword = await bcrypt.hash("secret", 1);
//     // await db.query("INSERT INTO users (username, password) VALUES ('test', $1)", [
//     //   hashedPassword
//     // ]);
//     const response = await request(app)
//       .post("/admin/login")
//       .send({
//         email: "admin1@eng.pdn.ac.lk",
//         password: "userPassword"
//       });
//     // take the result of the POST /users/auth which is a JWT
//     // store it in the auth object
//     auth.token = response.body.token;
//     // store the id from the token in the auth object
//     // auth.current_user_id = jsonwebtoken.decode(auth.token).user_id;
// });

// logging admin and getting token
describe('Creating a proctor, registering and getiing the tokens', () => {
    // getting admin token
    it('POST /api//admin/login', () => {
        return request(app)
        .post("/admin/login")
        .send({
            email: "admin1@eng.pdn.ac.lk",
            password: "userPassword"
        })
        .expect(200)
        .then((response) => {
            auth.token = response.body.token
        })

    })
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


describe('Testing for invalid addresses...', () => {
    it('GET /api/admin/invalid --> expects 404 response', () => {
        return request(app)
        .get('/admin/invalid')
        .expect(404)
    })
    it('POST /api/admin/invalid --> expects 404 response', () => {
        return request(app)
        .post('/admin/invalid')
        .expect(404)
    })
    it('PUT /api/admin/invalid --> expects 404 response', () => {
        return request(app)
        .put('/admin/invalid')
        .expect(404)
    })
    it('DELETE /api/admin/invalid --> expects 404 response', () => {
        return request(app)
        .delete('/admin/invalid')
        .expect(404)
    })
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// testing call to the admins collection
describe('Testing API calls to admins collections...', () => {
    it('GET /api/admin/admins/all - read all admins --> array of admin objects', () => {
        return request(app)
        .get('/admin/admins/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        name: expect.any(String),
                        email: expect.any(String),
                        isRegistered: expect.any(Boolean),
                        role: expect.any(String),
                        profile_picture: expect.any(String),
                        __v: expect.any(Number)
                    })
                ])
            )
        });
    });

    it('GET /api/admin/admins/self - read self admin --> array of admin objects', () => {
        return request(app)
        .get('/admin/admins/self')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String),
                    email: expect.any(String),
                    isRegistered: expect.any(Boolean),
                    role: expect.any(String),
                    profile_picture: expect.any(String),
                    __v: expect.any(Number)
                })
            )
        });
    });

    it('POST /api/admin/admins/single - create a single admin', () => {
        return request(app)
        .post('/admin/admins/single')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "name": "testAdmin",
            "email": "testadmin1@eng.pdn.ac.lk",
            "role": "super-admin"
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    it('DELETE /api/admin/admins/single - delete a single admin', () => {
        return request(app)
        .delete('/admin/admins/single/testadmin1@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });

});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// testing calls to the students collection
describe('Testing API calls to students collections...', () => {
    it('POST /api/admin/students/single - create a single student', () => {
        return request(app)
        .post('/admin/students/single')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            name: "testStudent",
            regNo: "E/XX/XXX",
            email: "teststudent@eng.pdn.ac.lk",
            department: "testDept",
            device: "device ID comes here"
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // editing the info of the created studeny
    it('PUT /api/admin/students/single/<email> - updating a single student', () => {
        return request(app)
        .put('/admin/students/single/teststudent@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            name: "UPDATEDtestStudent",
            regNo: "E/XX/XXX",
            email: "updatedteststudent@eng.pdn.ac.lk",
            department: "UPDATEDtestDept",
            device: "device ID comes here"
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    updatedEntry: expect.any(Object)
                })
            )
        });
    });

    // deleteing the student created and updated in the above test
    it('DELETE /api/admin/students/single/<student email> - delete a single student', () => {
        return request(app)
        .delete('/admin/students/single/updatedteststudent@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });

    // creating multiple students
    it('POST /api/admin/students/multiple - creating multiple students', () => {
        return request(app)
        .post('/admin/students/multiple')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            
            "uploaded_file": "students",
            "details": [
                [
                    "All registered students",
                    "",
                    "",
                    ""
                ],
                [
                    "#",
                    "Reg No.",
                    "Student name",
                    "Dept"
                ],
                [
                    "1",
                    "E/20/058",
                    "Suri",
                    "Suri@gmail.com",
                    "dept"
                ],
                [
                    "2",
                    "E/20/059",
                    "Devindi",
                    "Devindi@gmail.com",
                    "ce"
                ],
                [
                    "3",
                    "E/20/060",
                    "Sara",
                    "Sara@gmail.com",
                    "dept"
                ],
                [
                    "4",
                    "E/20/061",
                    "Mala",
                    "Mala@gmail.com",
                    "dept"
                ],
                [
                    "5",
                    "E/20/062",
                    "Milka",
                    "Milka@gmail.com",
                    "dept"
                ],
                [
                    "6",
                    "E/20/063",
                    "Kamala",
                    "Kamala@gmail.com",
                    ""
                ],
                [
                    "7",
                    "E/20/064",
                    "Boo",
                    "Boo@gmail.com",
                    ""
                ],
                [
                    ""
                ]
            ]
            
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // reading all created students 
    it('GET /api/admin/students/all - read all --> array of student objects', () => {
        return request(app)
        .get('/admin/students/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        name: expect.any(String),
                        email: expect.any(String),
                        isRegistered: expect.any(Boolean),
                        profile_picture: expect.any(String),
                        __v: expect.any(Number)
                    })
                ])
            )
        });
    });


    // // deleting all the studnts in the databases
    // it('DELETE /api/admin/students/all - delete all students', () => {
    //     return request(app)
    //     .delete('/admin/students/all')
    //     .set("authorization", 'BEARER ' + auth.token)
    //     .expect(200)
    //     .then((response) => {
    //         expect(response.body).toEqual(
    //             expect.objectContaining({
    //                 status: 'success',
    //                 message: expect.any(String),
    //                 deletedEntry: expect.any(Object)
    //             })
    //         )
    //     });
    // });
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// testing calls to the proctors collection
describe('Testing API calls to proctors collections...', () => {
    it('POST /api/admin/proctors/single - create a single proctor', () => {
        return request(app)
        .post('/admin/proctors/single')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "name": "testProctor",
            "email": "testproctor@eng.pdn.ac.lk"
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // editing the info of the created proctor
    it('PUT /api/admin/proctors/single/<email> - updating a single proctor', () => {
        return request(app)
        .put('/admin/proctors/single/testproctor@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "name": "UPDATEDtestProctor",
            "email": "updatedtestproctor@eng.pdn.ac.lk"
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    updatedEntry: expect.any(Object)
                })
            )
        });
    });

    // deleteing the proctor created and updated in the above test
    it('DELETE /api/admin/proctors/single/<proctor email> - delete a single proctor', () => {
        return request(app)
        .delete('/admin/proctors/single/updatedtestproctor@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });

    // creating multiple proctors
    it('POST /api/admin/proctors/multiple - creating multiple proctors', () => {
        return request(app)
        .post('/admin/proctors/multiple')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "uploaded_file": "proctors",
            "details": [
                [
                    "All registered protcors",
                    "",
                    "",
                    ""
                ],
                [
                    "#",
                    "Student name",
                    "Email",
                    "Dept"
                ],
                [
                    "1",
                    "proctor1",
                    "proctor1@eng.pdn.ac.lk",
                    "Electrical"
                ],
                [
                    "2",
                    "proctor2",
                    "proctor2@eng.pdn.ac.lk",
                    "Chemical"
                ],
                [
                    "3",
                    "proctor3",
                    "proctor3@eng.pdn.ac.lk",
                    "Mechanical"
                ],
                [
                    "4",
                    "proctor4",
                    "proctor4@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    "5",
                    "proctor5",
                    "proctor5@eng.pdn.ac.lk",
                    "Production"
                ],
                [
                    "6",
                    "proctor6",
                    "proctor6@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    "7",
                    "proctor7",
                    "proctor7@eng.pdn.ac.lk",
                    "Production"
                ],
                [
                    "8",
                    "proctor8",
                    "proctor8@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    "9",
                    "proctor9",
                    "proctor9@eng.pdn.ac.lk",
                    "Production"
                ],
                [
                    "10",
                    "proctor10",
                    "proctor10@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    "11",
                    "proctor11",
                    "proctor11@eng.pdn.ac.lk",
                    "Production"
                ],
                [
                    "12",
                    "proctor12",
                    "proctor12@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    "13",
                    "proctor13",
                    "proctor13@eng.pdn.ac.lk",
                    "Production"
                ],
                [
                    "14",
                    "proctor14",
                    "proctor14@eng.pdn.ac.lk",
                    "Computer"
                ],
                [
                    ""
                ]
            ]
            
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // reading all created proctors 
    it('GET /api/admin/proctors/all - read all --> array of proctor objects', () => {
        return request(app)
        .get('/admin/proctors/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        name: expect.any(String),
                        email: expect.any(String),
                        isRegistered: expect.any(Boolean),
                        profile_picture: expect.any(String),
                        __v: expect.any(Number)
                    })
                ])
            )
        });
    });


    // // deleting all the proctors in the databases
    // it('DELETE /api/admin/proctors/all - delete all proctors', () => {
    //     return request(app)
    //     .delete('/admin/proctors/all')
    //     .set("authorization", 'BEARER ' + auth.token)
    //     .expect(200)
    //     .then((response) => {
    //         expect(response.body).toEqual(
    //             expect.objectContaining({
    //                 status: 'success',
    //                 message: expect.any(String),
    //                 deletedEntry: expect.any(Object)
    //             })
    //         )
    //     });
    // });
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// testing api calls to the courses collections
describe('Testing API calls to courses collections...', () => {
    it('POST /api/admin/courses/single - create a single course', () => {
        return request(app)
        .post('/admin/courses/single')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "shortname": "testCourse-20XX",
            "fullname": "testCourse-20XX : This is a test course",
            "department": "testDept",
            "semester": "10",
            "lecturers": ["Dr. Nawinna", "Dr. Radhakrishna"],
            "students": ["E/17/190", "E/17/369", "E/17/058", "E/20/012"]
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // editing the info of the created course
    it('PUT /api/admin/courses/single/<short name> - updating a single course', () => {
        return request(app)
        .put('/admin/courses/single/testCourse-20XX')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "shortname": "UPDATEDtestCourse-20XX",
            "fullname": "updated full name",
            "department": "CO",
            "coordinator": "updated course coordinator",
            "lecturers": ["Dr. Nawinna", "Dr. Radhakrishna", "new lecturer"],
            "students": ["E/17/190", "E/17/369", "E/17/058", "E/20/012", "new student"]
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    updatedEntry: expect.any(Object)
                })
            )
        });
    });

    // deleteing the course created and updated in the above test
    it('DELETE /api/admin/courses/single/<shortname> - delete a single course', () => {
        return request(app)
        .delete('/admin/courses/single/UPDATEDtestCourse-20XX')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });

    // creating multiple courses
    it('POST /api/admin/courses/mastersheet - creating multiple courses', () => {
        return request(app)
        .post('/admin/courses/mastersheet')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "uploaded_file": "courses",
            "details": [
                [
                    "shortname",
                    "fullname",
                    "department",
                    "semester"
                ],
                [
                    "CE403-2021",
                    "CE403-2021 : Construction Management(July 2021 )",
                    "CE",
                    "7"
                ],
                [
                    "CE532-2021",
                    "CE532-2021 : Highway Engineering and Design",
                    "CE",
                    "7"
                ],
                [
                    "CE535-2021",
                    "CE535-2021 : Transportation Planning",
                    "CE",
                    "7"
                ],
                [
                    "CE542-2021",
                    "CE542-2021 : Hydraulic Structures",
                    "CE",
                    "7"
                ],
                [
                    "CE553-2021",
                    "CE553-2021 : Irrigation and Drainage Engineering",
                    "CE",
                    "7"
                ],
                [
                    "CE568-2021",
                    "CE568-2021 : Industrial Pollution Control",
                    "CE",
                    "7"
                ],
                [
                    "CE592-2021",
                    "CE592-2021 : Concrete Technology",
                    "CE",
                    "7"
                ],
                [
                    "CE594-2021",
                    "CE594-2021 : Computer Aided Structural Analysis and Design",
                    "CE",
                    "7"
                ],
                [
                    "CE598-2021",
                    "CE598-2021 : GIS and RS for Civil Engineers",
                    "CE",
                    "7"
                ],
                [
                    "CP502-2021",
                    "CP502-2021 : Advanced Fluid Mechanics",
                    "CP",
                    "7"
                ],
                [
                    "CP505-2021",
                    "CP505-2021 : Instrumentation and Measurement",
                    "CP",
                    "7"
                ],
                [
                    "CP508-2021",
                    "CP508-2021 : Energy Technology for the Process Industry",
                    "CP",
                    "7"
                ],
                [
                    "CP511-2021",
                    "CP511-2021 : Food Process Engineering",
                    "CP",
                    "7"
                ],
                [
                    "CP513-2021",
                    "CP513-2021 : Industrial Fluid Mechanics",
                    "CP",
                    "7"
                ],
                [
                    "CP518-2021",
                    "CP518-2021 : Polymer Science & Engineering",
                    "CP",
                    "7"
                ],
                [
                    "CP551-2021",
                    "CP551-2021 : Sustainable Development",
                    "CP",
                    "7"
                ],
                [
                    "EE401-2021",
                    "EE401-2021 : Communication Theory",
                    "EE",
                    "7"
                ],
                [
                    "EE402-2021",
                    "EE402-2021 : Advanced Control Systems",
                    "EE",
                    "7"
                ],
                [
                    "EE403-2021",
                    "EE403-2021 : Integrated Analog Electronic Circuits",
                    "EE",
                    "7"
                ],
                [
                    "EE404-2021",
                    "EE404-2021 : Electric Power Systems",
                    "EE",
                    "7"
                ],
                [
                    "EE501-2021",
                    "EE501-2021 : Advanced Control Systems",
                    "EE",
                    "7"
                ],
                [
                    "EE512-2021",
                    "EE512-2021 : Communication Theory",
                    "EE",
                    "7"
                ],
                [
                    "EE539-2021",
                    "EE539-2021 : Non linear and multivariable systems",
                    "EE",
                    "7"
                ],
                [
                    "EE554-2021",
                    "EE554-2021 : Microwave Techniques",
                    "EE",
                    "7"
                ],
                [
                    "EE559-2021",
                    "EE559-2021 : Integrated Analog Electronic Circuits",
                    "EE",
                    "7"
                ],
                [
                    "EE572-2021",
                    "EE572-2021 : Electric Power Systems",
                    "EE",
                    "7"
                ],
                [
                    "EE575-2021",
                    "EE575-2021 : Power Electronic Applications and Design",
                    "EE",
                    "7"
                ],
                [
                    "EE580-2021",
                    "EE580-2021 : Introduction to Biomedical Engineering",
                    "EE",
                    "7"
                ],
                [
                    "EE596-2021",
                    "EE596-2021 : Video and Image Processing",
                    "EE",
                    "7"
                ],
                [
                    "EF510-2021",
                    "EF510-2021 : Technology and Economic Development",
                    "GE",
                    "7"
                ],
                [
                    "EF516-2021",
                    "EF516-2021 : Painting and Sculpture",
                    "GE",
                    "7"
                ],
                [
                    "EF519-2021",
                    "EF519-2021 : Written English for Communication",
                    "GE",
                    "7"
                ],
                [
                    "EF521-2021",
                    "EF521-2021 : Intellectual Property",
                    "GE",
                    "7"
                ],
                [
                    "EF524-2021",
                    "EF524-2021 : Business Law",
                    "GE",
                    "7"
                ],
                [
                    "EF526-2021",
                    "EF526-2021 : Marketting & Financial Management",
                    "GE",
                    "7"
                ],
                [
                    "EF528-2021",
                    "EF528-2021 : Introduction to Digital Art",
                    "GE",
                    "7"
                ],
                [
                    "EF530-2021",
                    "EF530-2021 : Engineering Management",
                    "GE",
                    "7"
                ],
                [
                    "EM502-2021",
                    "EM502-2021 : Optimization",
                    "EM",
                    "7"
                ],
                [
                    "EM526-2021",
                    "EM526-2021 : Industrial Statistics",
                    "EM",
                    "7"
                ],
                [
                    "EM527-2021",
                    "EM527-2021 : Operational Research I",
                    "EM",
                    "7"
                ],
                [
                    "MA526-2021",
                    "MA526-2021 : Project Management",
                    "EM",
                    "7"
                ],
                [
                    "ME330-2021",
                    "ME330-2021 : Energy Technology",
                    "ME",
                    "7"
                ],
                [
                    "ME502-2021",
                    "ME502-2021 : Ergonomics",
                    "ME",
                    "7"
                ],
                [
                    "ME518-2021",
                    "ME518-2021 : Rigid Body Mechanics",
                    "ME",
                    "7"
                ],
                [
                    "ME520-2021",
                    "ME520-2021 : Computer Aided Modeling and Finite Element",
                    "ME",
                    "7"
                ],
                [
                    "PR404-2021",
                    "PR404-2021 : CAD/CAM",
                    "MIE",
                    "7"
                ],
                [
                    "PR408-2021",
                    "PR408-2021 : Industrial Engineering and Decision Sciences",
                    "MIE",
                    "7"
                ],
                [
                    "PR516-2021",
                    "PR516-2021 : Sustainable Manufacturing",
                    "MIE",
                    "7"
                ],
                [
                    "PR521-2021",
                    "PR521-2021 : Additive Manufacturing",
                    "MIE",
                    "7"
                ]
            ]
            
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // reading all created created courses 
    it('GET /api/admin/courses/all - read all --> array of course objects', () => {
        return request(app)
        .get('/admin/courses/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.any(String),
                        shortname: expect.any(String),
                        fullname: expect.any(String),
                        department: expect.any(String),
                        __v: expect.any(Number)
                    })
                ])
            )
        });
    });


    // deleting all the courses in the databases
    it('DELETE /api/admin/courses/all - delete all courses', () => {
        return request(app)
        .delete('/admin/courses/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// testing api calls to the exams collections
describe('Testing API calls to exams collections...', () => {

    // creating the exam for the courses in the exam collection
    it('POST /api/admin/courses/single - create a the course for the exam', () => {
        return request(app)
        .post('/admin/courses/single')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "shortname": "testCourse-20XX",
            "fullname": "testCourse-20XX : This is a test course",
            "department": "testDept",
            "semester": "10",
            "lecturers": ["Dr. Nawinna", "Dr. Radhakrishna"],
            "students": ["E/17/190", "E/17/369", "E/17/058", "E/20/012"]
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // creating exam from mastersheet
    it('POST /api/admin/exams/mastersheet - creating an exam', () => {
        return request(app)
        .post('/admin/exams/mastersheet')
        .set("authorization", 'BEARER ' + auth.token)
        .send({
            "uploaded_file": "mastersheet",
            "details": [
                [
                    "",
                    "",
                    "Examination",
                    "testCourse-20XX This is a test course",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Course code",
                    "testCourse-20XX",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Date",
                    "10/12/2023",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Time",
                    "10.00am",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Duration",
                    "3hrs",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Course coordinator",
                    "",
                    "Dr.ABC EFG",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Exam mode",
                    "",
                    "Online Proctored",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Authorized Materials",
                    "",
                    "none",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Additional Instructions",
                    "",
                    "none",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Video upload link (chief invigilator)",
                    "",
                    "",
                    "http://123.com",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Video upload link (invigilator)",
                    "",
                    "",
                    "http://123.com",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Total students",
                    "",
                    "",
                    "60",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "Total attendance",
                    "",
                    "",
                    "0",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "#",
                    "Reg No.",
                    "Eligible",
                    "Exam Room",
                    "Recorded video upload link",
                    "Chief Invigilator",
                    "Invigilator",
                    "Attendance",
                    "Remarks",
                    "FoEOAS Logs",
                    "Zoom logs",
                    "Technical Support Logs"
                ],
                [
                    "1",
                    "E/20/012",
                    "TRUE",
                    "A",
                    "<link to room A gDrive folder>",
                    "Dr.ABC EFG",
                    "Mr.hasd ahasd",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "2",
                    "E/20/022",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "3",
                    "E/20/025",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "4",
                    "E/20/039",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "5",
                    "E/20/049",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "6",
                    "E/20/054",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "7",
                    "E/20/055",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "8",
                    "E/20/057",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "9",
                    "E/20/061",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "10",
                    "E/20/068",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "11",
                    "E/20/069",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "12",
                    "E/20/070",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "13",
                    "E/20/076",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "14",
                    "E/20/078",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "15",
                    "E/20/081",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "16",
                    "E/20/083",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "17",
                    "E/20/086",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "18",
                    "E/20/087",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "19",
                    "E/20/088",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "20",
                    "E/20/089",
                    "TRUE",
                    "A",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "21",
                    "E/20/094",
                    "TRUE",
                    "B",
                    "<link to room B gDrive folder>",
                    "<room B C.Inv>",
                    "<room B Inv>",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "22",
                    "E/20/096",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "23",
                    "E/20/115",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "24",
                    "E/20/126",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "25",
                    "E/20/127",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "26",
                    "E/20/134",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "27",
                    "E/20/156",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "28",
                    "E/20/168",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "29",
                    "E/20/172",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "30",
                    "E/20/173",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "31",
                    "E/20/200",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "32",
                    "E/20/203",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "33",
                    "E/20/217",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "34",
                    "E/20/221",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "35",
                    "E/20/222",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "36",
                    "E/20/223",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "37",
                    "E/20/232",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "38",
                    "E/20/242",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "39",
                    "E/20/261",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "40",
                    "E/20/267",
                    "TRUE",
                    "B",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "41",
                    "E/20/275",
                    "TRUE",
                    "C",
                    "<link to room C gDrive folder>",
                    "<room C C.Inv>",
                    "<room C Inv>",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "42",
                    "E/20/276",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "43",
                    "E/20/286",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "44",
                    "E/20/290",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "45",
                    "E/20/313",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "46",
                    "E/20/319",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "47",
                    "E/20/320",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "48",
                    "E/20/332",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "49",
                    "E/20/351",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "50",
                    "E/20/360",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "51",
                    "E/20/364",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "52",
                    "E/20/366",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "53",
                    "E/20/368",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "54",
                    "E/20/369",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "55",
                    "E/20/377",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "56",
                    "E/20/388",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "57",
                    "E/20/389",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "58",
                    "E/20/394",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "59",
                    "E/20/396",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ],
                [
                    "60",
                    "E/17/190",
                    "TRUE",
                    "C",
                    "",
                    "",
                    "",
                    "FALSE",
                    "",
                    "",
                    "",
                    ""
                ]
            ]
            
        })
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    createdEntry: expect.any(Object)
                })
            )
        });
    });

    // reading all created exams 
    it('GET /api/admin/exams/all - read all --> array of exam objects', () => {
        return request(app)
        .get('/admin/exams/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        // _id: expect.any(String),
                        // name: expect.any(String),
                        // startTime: expect.any(Date),
                        // duration: expect.any(String),
                        // // students: expect.arrayContaining([
                        // //     expect.objectContaining({
                        // //         regNo: expect.any(String),
                        // //         eligible: expect.any(Boolean),
                        // //         exam_room: expect.any(String)
                        // //     })
                        // // ]),
                        // __v: expect.any(Number)
                    })
                ])
            )
        });
    });

    // reading all auto generated exam_rooms 
    it('GET /api/admin/examrooms/all - read all --> array of exam objects', () => {
        return request(app)
        .get('/admin/examrooms/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        // _id: expect.any(String),
                        // name: expect.any(String),
                        // startTime: expect.any(Date),
                        // duration: expect.any(String),
                        // // students: expect.arrayContaining([
                        // //     expect.objectContaining({
                        // //         regNo: expect.any(String),
                        // //         eligible: expect.any(Boolean),
                        // //         exam_room: expect.any(String)
                        // //     })
                        // // ]),
                        // __v: expect.any(Number)
                    })
                ])
            )
        });
    });

    // trying to delete the course with the exam
    it('DELETE /api/admin/courses/single/<shortname> - delete the course with the exam', () => {
        return request(app)
        .delete('/admin/courses/single/testCourse-20XX')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(400)
    });

    // deleteing the exam created in the above test
    it('DELETE /api/admin/exams/single/<name> - delete a single exam', () => {
        return request(app)
        .delete('/admin/exams/single/testCourse-20XX This is a test course')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    // deletedEntry: expect.any(Object)
                })
            )
        });
    });

    // reading all auto generated exam_rooms after deleting exam
    it('GET /api/admin/examrooms/all - read all --> array of exam objects', () => {
        return request(app)
        .get('/admin/examrooms/all')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    // expects empty array as all exam rooms are auto deleted
                ])
            )
        });
    });

    // deleteing the course after deleting an exam
    it('DELETE /api/admin/courses/single/<shortname> - delete the course after deleting the exam', () => {
        return request(app)
        .delete('/admin/courses/single/testCourse-20XX')
        .set("authorization", 'BEARER ' + auth.token)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    deletedEntry: expect.any(Object)
                })
            )
        });
    });
});
