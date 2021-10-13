
require('dotenv').config({path: './adminSecret.env'});  // adding the variables in secret.env to environment variables
const jwt = require('jsonwebtoken');

const admins = require('../models/admins');

exports.protectAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(authHeader.split(" ")[1]);
    // console.log(token);

    if(!token) {  // if authorization header is missing in the request
        return res.status(401).json({status: 'failure', meassage: 'Authorization header is missing in the request'});;
    }  // HAVE TO BE return response ?????

    // jwt.verify(token, proccess.env.JWT_SECRET_ADMIN, (err, user) => {
    //     if(err) return res.status(403).json({status: 'failure', message: 'Error occured while trying to verify token', error: String(err)});
    //     // if there's no error
    //     // admins.findById(user.id)
    //     // .then(admin => {
    //     //     if(!admin)
    //     //         return res.status(400).json({status: 'failure', meassage: 'Admin with the given token does not exist'});
            
    //     //     req.admin = admin;
    //     //     next();
    //     // })
    //     // .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find admin during authentication'}));
        
    //     // req.userID = user;  // user --> expected to be the _id of the user
    //     console.log('user isss: ');
    //     console.log(user);
    //     next();
    // })

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);  // synchronous function
        // decoded --> { id: '61655ca99b7b0434274ec356', iat: 1634133587, exp: 1634134187 }

        // console.log(decoded);
        // console.log(decoded.id);

        admins.findById(decoded.id)
        .then(admin => {
            if(!admin)
                return res.status(400).json({status: 'failure', meassage: 'Admin with the given token does not exist'});
            // console.log(admin);
            req.admin = admin;
            next();
            // console.log('buhahahahhahaaa');

        })
        .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find admin during authentication'}));

    }
    catch(error) {
        res.status(400).json({status: 'failure', message: 'Error occured while trying to to verify token', error: String(error)});
    }
}