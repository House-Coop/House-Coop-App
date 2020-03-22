
//expose the environmental variables
const env = require('dotenv').config();
if(env.error) throw new Error(env.error);

//make an instance of express
const express = require('express');
const fs = require('fs');

//middleware
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


//init app
const app = express();

/**
 * HTTPS
 */

if(process.env.NODE_ENV == "dev"){
	const https = require('https');

	https.createServer({
	  key: fs.readFileSync(process.env.SSL_CERT_KEY),
	  cert: fs.readFileSync(process.env.SSL_CERT)
	}, app).listen(parseInt(process.env.SSL_PORT));

} else {
	app.set("port", process.env.PORT || 3000);
	app.listen(process.env.PORT, function () {
		console.log('Server started on port: ' + process.env.PORT);
	});
}



/**
 * FILE UPLOAD
 */


//this doens't seem to work..
// const fileUpload = require('express-fileupload');

// app.use(fileUpload({
// 	useTempFiles : true,
//     tempFileDir : '/tmp/',
//     debug: true,
//     safeFileNames: true
// }));




// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');


if(process.env.NODE_ENV == "dev"){
	console.log(`App >> Now CORS is enabled for any origin...	`)
	app.use(cors({
		origin: true,
		credentials: true
		}));	
} else {
	console.log(`App >> No CORS. `)

}


/*

	DATABASE
	The db connect is made in sync, so we can assume the db is accessible beyond this point

*/

const db = require("./utils/db")

/*

	AUTH

*/

const auth = require("./utils/auth")
app.use(auth.session);
app.use(auth.logSession);

/*

	ROUTES

*/

let api = require('./routes/api');
let instance = require('./routes/instance');
let users = require('./routes/users');
let categories = require('./routes/categories');
let articles = require('./routes/articles');
let milestones = require('./routes/milestones')

//Set up the routes


app.use('/api/instance', instance);
app.use('/api/users', users);
app.use('/api/categories', categories);
app.use('/api/articles', articles);
app.use('/api/milestones', milestones);

//fall back
app.use('/api', api);

/**
 * STATIC FILES
 */

const serveStatic = require('serve-static');
const CONST = require('./constants.js')

app.use(serveStatic(__dirname + "/dist"));
app.use("/uploads",serveStatic(__dirname + "/uploads"));
app.use("/private",auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER),serveStatic(__dirname + "/private"));


/**
 * Gotta catch 'm all
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500).json({
			message: err.message,
			error: {}
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500).json({
		message: err.message,
		error: {}
	});
});


module.exports = app;
