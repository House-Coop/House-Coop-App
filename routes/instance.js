var express = require('express');
var _api = express.Router();
var cors = require('cors');
var _ = require('lodash');

var auth = require('../utils/auth')
var CONST = require('../constants.js');
/*

	01. INSTANCE

	Meta info about the instance

	POST /instance
	- setup first instance

	PUT /instance
	- change settings

	GET /instance
	- get meta data of instance 

	GET /public
	- get public data
	- allow CORS


*/

//const Instance 

var Instance = require('../models/instance.js'); //this model does not exist yet.


_api.post("/", function(req, res, next) {
	
	let _input = {
		title:req.body.title, 
		description:req.body.description,
	}

	let _newInstance = new Instance(_input);

	console.log("Creating new org: ",_newInstance);	
	
	_newInstance.save()
	.then(doc => {
		return res.json(doc);
	})
	.catch(next)


});

_api.put("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_ADMIN), function(req, res, next) {
	/*
	* This endpoint is custom to honour the immutable functions
	*/
	console.log(">> Instance > updating instance",req.body);
	Instance.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, new: true})
	.then(doc => {
		console.log(">> Instance > updated instance",doc);
	    return res.json(doc);
	})
	.catch(next)

});

_api.get("/", function(req, res, next) {
	
	Instance.findOne({}, {}, { sort: { 'created_at' : -1 } })
	.then(doc => {
		res.json(doc)
	})
	.catch(next)
});

//NOTE This is the only endpoint that is public, and allows for CORS
_api.get("/public", function(req, res, next) {
	Instance.findOne({}, {}, { sort: { 'created_at' : -1 } })
	.then(doc => {
		res.json(doc)
	})
	.catch(next)
});


_api.use(function (err, req, res, next) {
	console.log(">> Instance > err",err)
	res.status(500).json(err)
})

module.exports = _api;
