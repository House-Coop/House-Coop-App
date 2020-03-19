const express = require('express');
const _api = express.Router();
const cors = require('cors');
const _ = require('lodash');
const auth = require("../utils/auth")
const CONST = require("../constants.js");



/*

	02. USERS + AUTH

*/

console.log(`
	Users (router) >> now just plain register/login/update
	- confirm email flow for registration
	`)

const User = require('../models/user.js');

const multer  = require('multer')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/images/')
	},
	filename: function (req, file, cb) {
		//file.mimetype
		cb(null, file.fieldname + Date.now() + " - " + file.originalname) 
	}
})

const upload = multer({ 
	storage: storage
})

//for all these endpoints we set the minimum level to be VISITOR

_api.get("/profile", auth.setPrivilegeLevel(0), function(req, res, next){
	User.findOne({ _id: req.session.user.user_id },['username','email','privilege', 'createdAt', 'description', 'profileImg'])
	.then(doc => {
		doc.publicKey = process.env.ADMIN_PUBLIC_KEY;
		res.json(doc);
	})
	.catch(next);
	
});

_api.post("/login", async function(req, res, next) {
	
	//this call should populate the session object
	try{ 
		//first we check if the user exists

		console.log(">> Users > find: ",req.body.email);

		const user = await User.findOne({ email: req.body.email });
		
		if(!user) throw new Error("User not found");

		if(user.comparePasswords(req.body.password)){
			const sessionUserObj = auth.sessionUserObj(user);
			req.session.user = sessionUserObj;
			let response = sessionUserObj;
			response.publicKey = process.env.ADMIN_PUBLIC_KEY;
			console.log(response);
			res.json(response)

		} else {
			throw new Error("Invalid credentials");
		}
	} 
	catch(err){
		console.log(err);
		res.status(403).json(err);
	}

});

_api.post("/register", async function(req, res, next) {
	
	//we create a new user
	user = new User({
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
		publicKey: req.body.publicKey,
		description: req.body.description
	});
	
	//we validate the user by saving it, let the model do the validation

	try{

		const isFirstAdmin = (await User.countDocuments({privilege: {"$gt": CONST.USER_PRIVILEGE_BOARD}}) == 0);
		if(isFirstAdmin) user.privilege = CONST.USER_PRIVILEGE_ADMIN;
		
		await user.save();

		const sessionUserObj = auth.sessionUserObj(user);
		req.session.user = sessionUserObj;

		res.json(Object.assign(sessionUserObj,{publicKey: process.env.ADMIN_PUBLIC_KEY}))

		console.log(req.session);

	}
	catch(err) {
		console.log(err);
		res.status(403).json(err);
	}
	
});

_api.all("/logout", function(req, res, next) {
	
	console.log(">> req.session",req.session.user);
	try{
		const user = req.session.user;
		if(user) {
			req.session.destroy(err => {
				if (err) throw (err);
				res.clearCookie(CONST.SESSION_NAME);
				res.send(user);
			});
		} else {
			throw new Error('Something went wrong');
		}
	} catch(err) {
		console.log("trying to logout, didn't work...");
		res.status(422).send(err);
	}
});

//access other users
_api.get("/", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER),  function(req, res, next) {

	const privilege = req.session.user.privilege;
 
	User.find({})
	.then(_doc => {
		
		let doc = {
			members: _doc,
			you: req.session.user.user_id
		} 

		res.json(doc)
	})
	.catch(next)
	
});

_api.get("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {
	User.findOne({_id: req.params.id})
	.then(doc => {
		res.json(doc);
	})
	.catch(next)
});

_api.put("/:id", [auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_ASPIRANT), upload.single('profileImg')], function(req, res, next) {
	
	/*
	 * This endpoint is an exception, because it can be both edited by the user and the admin.
	 * we set the baseline for the session to be aspirant, because any registered members has this level. 
	 _api.put("/:id", [auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_ASPIRANT), upload.single('profileImg')], function(req, res, next) {
	 */

	//first we check if the user is either editing their own resource, of user has sufficient privilege
	if( req.params.id == req.session.user.user_id || 
		req.session.user.privilege >= CONST.USER_PRIVILEGE_BOARD){

				
		let allowedPaths = ['privilege','username','password','email','publicKey', 'description', 'profileImg'];
		let _upsertQuery = _.pick(req.body, allowedPaths);


		if(req.file) {
			console.log("/users/:id >> ", req.file.path);
			_upsertQuery.profileImg = req.file.path
		}



		return User.findOneAndUpdateSafely({_id: req.params.id},_upsertQuery, {upsert: true, new: true})
		.then(doc => {
			return res.json(doc)
		})
		.catch(next)
	}

	//otherwise, fail with error.
	res.status(403).json({"err":"Access denied"});
	
});

_api.delete("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_ASPIRANT), function(req, res, next) {

	/*
	 * This endpoint is an exception, because it can be both edited by the user and the admin.
	 * we set the baseline for the session to be aspirant, because any registered members has this level. 
	 */

	//first we check if the user is either editing their own resource, of user has sufficient privilege
	if( req.params.id == req.session.user.user_id || 
		req.session.user.privilege >= CONST.USER_PRIVILEGE_BOARD){
		
		return User.findOneAndDelete({_id: req.params.id})
		.then(doc => {
			return res.json(doc)
		})
		.catch(next)
	}

	res.status(403).json({"err":"Access denied"});


});


_api.use(function (err, req, res, next) {
	console.log("ERR",err);
	res.status(500).json(err)
})



module.exports = _api;
