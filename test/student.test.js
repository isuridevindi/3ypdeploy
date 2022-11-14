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
//       .post("/proctor/login")
//       .send({
//         email: "testproctor1@eng.pdn.ac.lk",
//         password: "userPassword"
//       });
//     // take the result of the POST /users/auth which is a JWT
//     // store it in the auth object
//     auth.ptoken = response.body.token;
//     // store the id from the token in the auth object
//     // auth.current_user_id = jsonwebtoken.decode(auth.token).user_id;
// });


// creating a student, registering and getiing the tokens
describe('Creating a student, registering and getiing the tokens', () => {
    // getting admin token
    it('POST /api/admin/login', () => {
        return request(app)
        .post("/admin/login")
        .send({
            email: "admin1@eng.pdn.ac.lk",
            password: "userPassword"
        })
        .expect(200)
        .then((response) => {
            auth.atoken = response.body.token
        })

    })
    
    // creating a student (admin API call)
    it('POST /api/admin/students/single', () => {
        return request(app)
        .post('/admin/students/single')
        .set("authorization", 'BEARER ' + auth.atoken)
        .send({
            name: "teststudent1",
            regNo: "E/YY/YYY",
            email: "teststudent1@eng.pdn.ac.lk",
            department: "testDept",
            device: "device ID comes here"
        })
        .expect(200)
    })

    it('POST /api/student/register', () => {
        return request(app)
        .post('/student/register')
        .send({
            email: "teststudent1@eng.pdn.ac.lk",
            password0: "userPassword",
            password1: "userPassword"
        })
        .expect(200)
    })

    it('POST /api/student/login', () => {
        return request(app)
        .post('/student/login')
        .send({
            email: "teststudent1@eng.pdn.ac.lk",
            password: "userPassword"
        })
        .expect(200)
        .then((response) => {
            auth.stoken = response.body.token
        })
    })

});

// testing for invalid calls 
describe('Testing for invalid addresses...', () => {
    it('GET /api/student/invalid --> expects 404 response', () => {
        return request(app)
        .get('/student/invalid')
        .expect(404)
    })
    it('POST /api/student/invalid --> expects 404 response', () => {
        return request(app)
        .post('/student/invalid')
        .expect(404)
    })
    it('PUT /api/student/invalid --> expects 404 response', () => {
        return request(app)
        .put('/student/invalid')
        .expect(404)
    })
    it('DELETE /api/student/invalid --> expects 404 response', () => {
        return request(app)
        .delete('/student/invalid')
        .expect(404)
    })
});

// testing calls to the students collections
describe('Testing API calls to students collections...', () => {
    it('GET /api/student/students/self - getting self info', () => {
        return request(app)
        .get('/student/students/self')
        .set("authorization", 'BEARER ' + auth.stoken)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    name: expect.any(String),
                    email: expect.any(String),
                    regNo: expect.any(String),
                    isRegistered: expect.any(Boolean),
                    department: expect.any(String)
                })
            )
        });
    });

    // editing the info of the created student
    it('PUT /api/student/students/self - updating a self student', () => {
        return request(app)
        .put('/student/students/self')
        .set("authorization", 'BEARER ' + auth.stoken)
        .send({
            "name": "UPDATEDteststudent1",
            "regNo": "E/XX/XXX",
            "email": "teststudent1@eng.pdn.ac.lk",
            "department": "UPDATEDtestDept"
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

});



// deleting the created student course
describe('Deleting the test student (and all the students)', () => {

    it('DELETE /api/admin/students/single/<student email> - delete the test proctor', () => {
        return request(app)
        .delete('/admin/students/single/teststudent1@eng.pdn.ac.lk')
        .set("authorization", 'BEARER ' + auth.atoken)
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

    // deleting all the studnts in the databases
    it('DELETE /api/admin/students/all - delete all students', () => {
        return request(app)
        .delete('/admin/students/all')
        .set("authorization", 'BEARER ' + auth.atoken)
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

