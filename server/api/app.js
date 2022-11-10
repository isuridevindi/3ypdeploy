
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
// const app = express();
const bodyParser = require('body-parser');

// setting environment variables
require('dotenv').config({path: './config.env'});

const mongoose = require('mongoose');

/**
 * Connecting with the mongodb server
 * The API server will have the connection with the mongod server as long as the API server is up
 * refer the following link to try and make custom connections
 * https://mongoosejs.com/docs/models.html#:~:text=If%20you%20create%20a-,custom%20connection,-%2C%20use%20that%20connection%27s
 */
// mongoose.connect('mongodb://localhost:27017/remote_proctoring_system');

////////////////////////////////
// to connect to atlas mongoDB
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoose...'));
// .then(() => console.log('Connected to atlas MongoDB...'))
// .catch(err => console.log(err));

// importing the modules containing the routers  (can also straight awa require as the second argument of app.use())
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminsRouter = require('./routes/api/admin');
var proctorsRouter = require('./routes/api/proctor');
var studentsRouter = require('./routes/api/student');
const { rejects } = require('assert');



const app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// initializing logger middele ware used for development  
// app.use(logger('dev'));

// // body parser middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));



// app.use(cookieParser());

//set a static folder
//this folder is the place where the server searches for the index.html file 
// first checks inside the public folder for index.html, if not found uses the route to view engine's index
app.use(express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(bodyParser.json());  // BODY PARSER
// app.use(express.urlencoded({ extended: false }));

/////////////////////////////////////////////////////////////////////////////////
// insert the routes here
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminsRouter);
app.use('/proctor', proctorsRouter);  // APIs used by the proctor's side UI
app.use('/student', studentsRouter);  // APIs used by the students' side UI
/////////////////////////////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
