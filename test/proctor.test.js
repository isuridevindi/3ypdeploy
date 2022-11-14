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


// creating a proctor, registering and getiing the tokens
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
            auth.atoken = response.body.token
        })

    })
    
    // creating a proctor (admin API call)
    it('POST /api/admin/proctors/single', () => {
        return request(app)
        .post('/admin/proctors/single')
        .set("authorization", 'BEARER ' + auth.atoken)
        .send({
            "name": "testProctor1",
            "email": "testproctor1@eng.pdn.ac.lk",
            "department": "testDept"
        })
        .expect(200)
    })

    it('POST /api/proctor/register', () => {
        return request(app)
        .post('/proctor/register')
        .send({
            email: "testproctor1@eng.pdn.ac.lk",
            password0: "userPassword",
            password1: "userPassword"
        })
        .expect(200)
    })

    it('POST /api/proctor/login', () => {
        return request(app)
        .post('/proctor/login')
        .send({
            email: "testproctor1@eng.pdn.ac.lk",
            password: "userPassword"
        })
        .expect(200)
        .then((response) => {
            auth.ptoken = response.body.token
        })
    })

});

// testing for invalid calls 
describe('Testing for invalid addresses...', () => {
    it('GET /api/proctor/invalid --> expects 404 response', () => {
        return request(app)
        .get('/proctor/invalid')
        .expect(404)
    })
    it('POST /api/proctor/invalid --> expects 404 response', () => {
        return request(app)
        .post('/proctor/invalid')
        .expect(404)
    })
    it('PUT /api/proctor/invalid --> expects 404 response', () => {
        return request(app)
        .put('/proctor/invalid')
        .expect(404)
    })
    it('DELETE /api/proctor/invalid --> expects 404 response', () => {
        return request(app)
        .delete('/proctor/invalid')
        .expect(404)
    })
});

// testing calls to the proctors collections
describe('Testing API calls to proctors collections...', () => {
    it('GET /api/proctor/proctors/self - getting self info', () => {
        return request(app)
        .get('/proctor/proctors/self')
        .set("authorization", 'BEARER ' + auth.ptoken)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    name: expect.any(String),
                    email: expect.any(String),
                    isRegistered: expect.any(Boolean),
                    department: expect.any(String)
                })
            )
        });
    });

    // editing the info of the created proctor
    it('PUT /api/proctor/proctors/self - updating a self proctor', () => {
        return request(app)
        .put('/proctor/proctors/self')
        .set("authorization", 'BEARER ' + auth.ptoken)
        .send({
            "name": "UPDATEDtestProctor1",
            "email": "testproctor1@eng.pdn.ac.lk"
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


////////////////////////////////////////////////////////////////
// testing api calls to the courses collections
describe('Testing API calls to courses collections...', () => {

    // reading all created created courses 
    it('GET /api/proctor/courses/all - read all --> array of course objects', () => {
        return request(app)
        .get('/proctor/courses/all')
        .set("authorization", 'BEARER ' + auth.ptoken)
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    // expect.objectContaining({
                    //     _id: expect.any(String),
                    //     shortname: expect.any(String),
                    //     fullname: expect.any(String),
                    //     department: expect.any(String),
                    //     __v: expect.any(Number)
                    // })
                    // expects an empty array
                ])
            )
        });
    });
});

// deleting the created proctor course
describe('Deleting the test proctor (and all proctors)', () => {

    it('DELETE /api/admin/proctors/single/<proctor email> - delete the test proctor', () => {
        return request(app)
        .delete('/admin/proctors/single/testproctor1@eng.pdn.ac.lk')
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

    // deleting all the proctors in the databases
    it('DELETE /api/admin/proctors/all - delete all proctors', () => {
        return request(app)
        .delete('/admin/proctors/all')
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

