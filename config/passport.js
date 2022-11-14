
// NOT USED
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// load user models
const proctors = require('../models/proctors');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            // user match
            proctors.findOne({email})
            .then(proctor => {
                if(!proctor)  // checking whether there's a proctor with the given email
                    return done(null, false, {message: 'That email is not regitered by the admin as a proctor'});
                // proctor with the given email exists in the DB
                else {
                    if(proctor.password == '')  // checking whether the proctor has registered
                        return done(null, false, {message: 'The proctor has not yet registered'});
                    // proctor with the email has registered
                    else {
                        // match password
                        bcrypt.compare(password, proctor.password, (err, isMatch) => {
                            if(err) throw err;  // HANDLE HERE

                            if(isMatch) {
                                return done(null, proctor)
                            }
                            else {
                                return done(null, false, {message: 'Password incorrect'});
                            }
                        });
                    }
                }
            })
            .catch(err => res.status(400).json({status: 'failure', message: 'Error occured while trying to find the proctor with the given email', error: String(err)}));  // CHECK THE STATUS CODE);

        })
    );
}

/// incomplete.
// followed this to get this far --> https://www.youtube.com/watch?v=6FOq4cUdH8k