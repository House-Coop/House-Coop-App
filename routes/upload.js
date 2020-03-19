const express = require('express');
const _api = express.Router();
const auth = require("../utils/auth")
const CONST = require("../constants.js");

_api.post('/private',auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER),function(req, res, next) {
	
	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let _file = req.files.file;
	let _fileName = new Date() + _file.name;

	// Use the mv() method to place the file somewhere on your server
	_file.mv(`/uploads/private/${_fileName}`, function(err) {
		if (err) return res.status(500).send(err);
		res.json({msg: 'File uploaded!'});
	});
});

_api.post("/public",auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), async function(req,res,next){

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let _file = req.files.file;
	let _fileName = new Date() + _file.name;

	// Use the mv() method to place the file somewhere on your server
	_file.mv(`/uploads/private/${_fileName}`, function(err) {
		if (err) return res.status(500).send(err);
		res.json({msg: 'File uploaded!'});
	});


})


_api.use(function (err, req, res, next) {
	console.log("ERR",err);
	res.status(500).json(err)
})



module.exports = _api;
