var express = require('express');
var _api = express.Router();
var cors = require('cors');
var _ = require('lodash');
const auth = require("../utils/auth")
const CONST = require('../constants.js')

/*

	0x Milestones

	//request all categories
	GET /
	- list all milestones

	POST /
	- create milestone



	PUT /:id
	- change properties of milestone

	DELETE /:id	
	- delete milestone


*/

/**
 * File upload
 */


const Milestone = require('../models/milestone.js');

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




_api.get("/", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {
	Milestone.find()
	.populate("articles")
	.then(docs => {
		return res.json(docs)
	})
	.catch(next)
});

// _api.post("/", [
// 	auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]),
// 	upload.single('image')
// 	], function(req, res, next) {

// 	console.log("POST api/milestones articles: ", req.body.articles);
// 	let _input = {
// 		title:req.body.title, 
// 		description:req.body.description,
// 		dueDate:req.body.dueDate,
// 		articles: req.body.articles
// 	}
// 	if(req.file) _input.image = req.file.path;
	

// 	let _newMilestone = new Milestone(_input);	
	
// 	_newMilestone.save()
// 	.then(doc => {
// 		return res.json(doc);
// 	})
// 	.catch(next)

// });

_api.post("/", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {

	let _newDoc = {title:req.body.title, description:req.body.description, dueDate:req.body.dueDate ,articles:req.body.articles}	
	let _newMilestone = new Milestone(_newDoc);
		
	_newMilestone.save()
	.then(doc => {
		res.json(doc)
	})
	.catch(next)
	
});

_api.get("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {

	Milestone.findOne({_id: req.params.id})
	.populate("articles")
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)
});

_api.put("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]), function(req, res, next) {

	let _upsertQuery = req.body;

	Milestone.findOneAndUpdate({_id: req.params.id},_upsertQuery, {upsert: true, new: true})
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)
});

_api.delete("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]), function(req, res, next) {
	Milestone.findOneAndDelete({_id: req.params.id},{})
	.then(result => {
		return res.json(result)
	})
	.catch(next)
});

_api.use(function (err, req, res, next) {
	res.status(500).json(err)
})

module.exports = _api;
