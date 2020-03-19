const express = require('express');
const _api = express.Router();
const url = require('url');
const cors = require('cors');
const _ = require('lodash');
const mongoose = require('mongoose');
const auth = require("../utils/auth")
const CONST = require('../constants.js')

/*

	04. ARTICLE

	GET /
	- this endpoint should be here to retrieve orphan articles or repair category fups
	
	This is the CRUD of the articles

	POST /:category_name
	- create new article in category

	POST /
	- create new article, without category
	
	GET /:id
	GET /category/:category_name/:id
	- view article

	PUT /:id
	PUT /category/:category_name/:id
	- edit article
	- only articles in draft can be edited

	DELETE /:id
	- only articles in draft can be deleted

*/

const Article = require('../models/article.js');
const Category = require('../models/category.js');
const User = require('../models/user.js');



const isObjectId = _objectId => {
	//check if the id passed in params is of type objectId
	if(!_objectId) return false;
	return mongoose.Types.ObjectId.isValid(_objectId);
}
const checkParamsId = (req, res, next) => {
	//check params for falsy id's
	if(!req.params.id) return next();
	if(!isObjectId(req.params.id)) return next(new Error("this is not an id"))
	next()
}
const sanatizeBody = (req, res, next) => {
	//we don't allow users to set the status of documents
	if(req.body.lock) delete req.body.lock
	next()
}

_api.use(checkParamsId);
_api.use(sanatizeBody);

_api.post("/", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {

	let _newDoc = {title:req.body.title, description:req.body.description, category: req.body.category}	
	let _newArticle = new Article(_newDoc);
		
	_newArticle.save()
	.then(doc => {
		res.json(doc)
	})
	.catch(next)
	
});

_api.get("/", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {
	
	let _query = {};
	
	//if articles for a certain category were requested, we double check of that category exists.
	if(isObjectId(req.query.category)){
		_query.category = req.query.category;
	}
		
	Article.find(_query)
	.populate("category")
	.then(doc => {
		res.json(doc)
	})
	.catch(next)

});

_api.get("/search", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {
	
	let _query = {};
	
	//if articles for a certain category were requested, we double check of that category exists.
	if(isObjectId(req.query.category)){
		_query.category = req.query.category;
	}
		
	Article.find(_query, ["_id", "title", "description","lock", "status", "createdAt"])
	
	.then(doc => {
		res.json(doc)
	})
	.catch(next)

});

_api.get("/votes", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {
	Article.find({"lock" : {$exists: true}})
	.populate("category")
	.then(docs => {
		return res.json(docs)
	})
	.catch(next)

});



_api.get("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_FINANCIER), function(req, res, next) {
	
	Article.findOne({_id: req.params.id})
	.populate("category")
	.then(doc => {
	    return res.json(doc);
	})
	.catch(next)
});

_api.put("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {
	/*
	* This endpoint is custom to honour the immutable functions
	*/

	Article.findOneAndUpdateSafely({_id: req.params.id}, req.body, {upsert: true, new: true})
	.then(doc => {
	    return res.json(doc);
	})
	.catch(next)

});

_api.delete("/:id", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD), function(req, res, next) {

	Article.findOneAndDelete({_id: req.params.id},{})
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)
});

/*

	ARTICLE >> VOTING

	GET /:id/vote
	- calling this endpoint retreives the status of the vote
	- maybe include the smart contracts in the response?
	- maybe this is included in the article already
	
	POST /:id/vote
	- this endpoints creates a vote on the article

	GET /:id/ballot
	- user can retreive their ballot

	PUT /:id/ballot
	- user can make their choice and submit their ballot

*/

_api.get("/:id/vote", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {
	
	Article.findOne({"lock._id": req.params.id})
	.populate("category")
	.then(doc => {
		return res.json(doc)
	})
	.catch(next)

});

_api.post("/:id/vote", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_BOARD),  function(req, res, next) {

	Article.findOneAndApplyLock({_id: req.params.id},req.body)
	.then(doc => {
		console.log(">> after a long loop-the-loop, back at responding");
		return res.json(doc)
	})
	.catch(next)

});

_api.get("/:id/ballot",auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER),  function(req, res, next) {

	/*
	 * The user requests a ballot, attached to a certain article.
	 */

	Promise.all([
		User.findOne({_id: req.session.user.user_id},'publicKey'),
		Article.findOne({_id: req.params.id},'lock')
		])
	.then(results => {
		const user = results[0];
		const article = results[1];


		const ballot = _.find(article.lock.ballots, _ballot => {
			return (_ballot.publicKey == user.publicKey);
		});
		if(!ballot) return res.status(404).json({err: "ballot not found"}); 

		//user already voted
		const signedBallot =  _.find(article.lock.signedBallots, _ballot => {
			return (_ballot.publicKey == user.publicKey);
		});
		
		if(signedBallot) return res.status(500).json({err: "user has already voted"}); 

		return res.json(ballot)
	})
	.catch(next)
});

_api.put("/:id/ballot", auth.setPrivilegeLevel(CONST.USER_PRIVILEGE_MEMBER), function(req, res, next) {

	Article.findOne({_id: req.params.id})
	.then(article => {
		//user already voted
		const signedBallot =  _.find(article.lock.signedBallots, _ballot => {
			return (_ballot.publicKey == req.body.publicKey);
		});
		
		if(signedBallot) return res.status(500).json({err: "user has already voted"}); 

		article.lock.signedBallots.push(req.body);
		return article.save()
	})
	.then(doc => {
		res.json(doc)
	})
	.catch(next)

});

_api.use(function (err, req, res, next) {
	console.log("\n\n>>",err)
	res.status(500).json(err)
})



module.exports = _api;
