var express = require('express');
var api = express.Router();
var cors = require('cors');
var _ = require('lodash');

/********************

API

*********************/


/* 
	STATIC
	Testing endpoint for uptime, meta-info about the status of the API
*/

api.get('/', function(req, res, next) {
	res.json({ 
		title: 'Equitable OS', 
		version: "0.0.1"
	});
});


api.all("*", function(req, res, next) {
	res.status(404).json({});
});


module.exports = api;
