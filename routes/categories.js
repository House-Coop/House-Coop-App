var express = require('express');
var _api = express.Router();
var cors = require('cors');
var _ = require('lodash');
const auth = require("../utils/auth")
const CONST = require('../constants.js')

/*

	03. CATEGORIES

	//request all categories
	GET /
	- list all categories

	POST /
	- create category

	REMOVED
		GET /:id
		- retrieve all articles in this category
		- this endpoint is /articles/?category=category_id

	PUT /:id
	- change properties of category

	DELETE /:id	
	- delete category.


*/

/**
 * File upload
 */


const Category = require('../models/category.js');

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
	Category.find()
	.then(docs => {
		return res.json(docs)
	})
	.catch(next)
});

_api.post("/", [
	auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]),
	upload.single('image')
	], function(req, res, next) {

	let _input = {
		title:req.body.title, 
		description:req.body.description,
		color: req.body.color
	}
	if(req.file) _input.image = req.file.path;

	let _newCategory = new Category(_input);	
	
	_newCategory.save()
	.then(doc => {
		return res.json(doc);
	})
	.catch(next)

});

_api.get("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {

	Category.findOne({_id: req.params.id})
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)
});

_api.put("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]), function(req, res, next) {

	let _upsertQuery = req.body;

	Category.findOneAndUpdate({_id: req.params.id},_upsertQuery, {upsert: true, new: true})
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)
});

_api.delete("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD, [CONST.USER_PRIVILEGE_COACH]), function(req, res, next) {
	Category.findOneAndDelete({_id: req.params.id},{})
	.then(result => {
		return res.json(result)
	})
	.catch(next)
});

_api.use(function (err, req, res, next) {
	res.status(500).json(err)
})

module.exports = _api;
