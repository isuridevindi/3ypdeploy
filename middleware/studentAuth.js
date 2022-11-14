require('dotenv').config({path: './studentSecret.env'});  // adding the variables in secret.env to environment variables
const jwt = require('jsonwebtoken');

const students = require('../models/students');

exports.protectStudent = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(authHeader.split(" ")[1]);
    // console.log(token);

    if(!token) {  // if authorization header is missing in the request
        return res.status(400).json({status: 'failure', meassage: 'Authorization header is missing in the request'});;
    }  // HAVE TO BE return response ?????

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_STUDENT);  // synchronous function
        // console.log(decoded);

        students.findById(decoded.id)
        .then(student => {
            if(!student)
                return res.status(400).json({status: 'failure', meassage: 'Student with the given token does not exist'});
            
            req.student = student;
            next();
        })
        .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find student during authentication', error: String(err)}));

    }
    catch(error) {
        res.status(400).json({status: 'failure', message: 'Error occured while trying to to verify token', error: String(error)});
    }
}