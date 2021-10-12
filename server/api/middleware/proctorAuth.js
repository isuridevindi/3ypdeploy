
require('dotenv').config({path: './proctorSecret.env'});  // adding the variables in secret.env to environment variables
const jwt = require('jsonwebtoken');

const proctors = require('../models/proctors');

exports.protectProctor = (req, res, next) => {
    let token;
    token = req.headers.authorization;
    const tokenId = token.split(" ")[1];

    if(!token) {  // if authorization header is missing in the request
        return res.status(400).json({status: 'failure', meassage: 'Authorization header is missing in the request'});;
    }  // HAVE TO BE return response ?????

    try{
        const decoded = jwt.verify(tokenId, proccess.env.JWT_SECRET);  // synchronous function
        console.log(decoded);

        proctors.findById(decoded.id)
        .then(proctor => {
            if(!proctor)
                return res.status(400).json({status: 'failure', meassage: 'Proctor with the given token does not exist'});
            
            req.proctor = proctor;
            next();
        })
        .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find proctor during authentication'}));

    }
    catch(error) {
        res.status(400).json({status: 'failure', message: 'Error occured while trying to to verify token', error});
    }
}