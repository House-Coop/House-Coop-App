// const jwt = require("jsonwebtoken");
const session = require('express-session');
const mongoose = require('mongoose');
const CONST = require("../../constants.js");
const User = require('../../models/user.js');

//save sessions to mongo
const MongoStore = require('connect-mongo')(session);


//create session object
module.exports.session = session({
	name: CONST.SESSION_NAME,
	secret: CONST.SESSION_SECRET,
	saveUninitialized: true,
	resave: false,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		collection: 'session',
		ttl: parseInt(CONST.SESSION_LIFETIME) / 1000
	}),
	cookie: {
	sameSite: true,
	secure: false,
	maxAge: parseInt(CONST.SESSION_LIFETIME)
	}
});

module.exports.sessionUserObj = function(_user){
	return {
		username 	: _user.username,
		user_id 	: _user._id,
		_id 		: _user._id,
		privilege 	: _user.privilege,
	}
}

//middleware to return session object
module.exports.logSession = function(req, res, next){

	// console.log(">> session: ",req.session);
	// if(!req.session.user) return res.status(403).json({"err":"not authorised"});

	next();
}

module.exports.setPrivilegeLevel = function(_min_privilege_level, _excluded){
	
	//the default privilege level is Board
	const min_privilege_level = (_min_privilege_level === undefined) ? CONST.USER_PRIVILEGE_BOARD : _min_privilege_level;
	
	//making sure excluded has a value
	let excluded = _excluded || [];

	//and that that value is an array

	excluded = (Array.isArray(excluded)) ? excluded : [excluded];

	//return the middleware
	return function(req,res,next){
		
		//Public content is accesible for visitors;
		//the abscence of a session is no obstruction
		if(min_privilege_level === CONST.USER_PRIVILEGE_VISITOR) next();
		
		//for any other level, we require a session
		if(!req.session.user) return res.status(403).json({"err":"not logged in"});

		//then we check if user had the min. privileges
		if(req.session.user.privilege < min_privilege_level) return res.status(403).json({"err":"insufficient privileges"});

		//and whether you are not excluded from accessing this resource
		if(excluded.indexOf(req.session.user.privilege) >= 0) return res.status(403).json({"err":"excluded from accessing this resource"});


		next();
	}

}

/*
 * 	USER_PRIVILEGE_ADMIN : 10,
	USER_PRIVILEGE_FOUNDER : 9,
	USER_PRIVILEGE_BOARD: 8,
	USER_PRIVILEGE_MEMBER : 7,
	USER_PRIVILEGE_COACH : 6,
	USER_PRIVILEGE_PARTNER : 5,
	USER_PRIVILEGE_FINANCIER : 4,
	USER_PRIVILEGE_APPLICANT_MEMBER : 3,
	USER_PRIVILEGE_APPLICANT_COACH :  2,
	USER_PRIVILEGE_APPLICANT_PARTNER : 1,
	USER_PRIVILEGE_ASPIRANT :  0,
	USER_PRIVILEGE_VISITOR : -1,

 */