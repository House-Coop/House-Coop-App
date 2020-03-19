const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')
const bcrypt = require('bcryptjs')

const CONST = require('../constants');

const zenroomHelper = require('../utils/zenroomHelper');


const InstanceSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Please provide a title'],
	},
	description: {
		type: String,
		required: [true, 'Please provide a body'],
	},
	publicKey: String
},  
{ 
	timestamps: true, 
	strict: "throw",
	// capped: {
	// 	max: 1,
	// 	size: 4096 
	// }
});

InstanceSchema.set('toObject', { virtuals: true });
InstanceSchema.set('toJSON', { virtuals: true });

/************* 
*
*
* Functions 
* ------------- 
* Helper functions to warrant immutability
* 
*
*************/

async function generateAppCredentials(_username){

	const username = _username || "User";

	const params = {
		"script": ` rule check version 1.0.0
					Scenario 'simple': Create the keypair
					Given that I am known as '${username}'
					When I create the keypair
					Then print my data`,
		"data": {},
		"keys": {},
		"conf": CONST.zenroomSettings,
	}

	const ZR = new zenroomHelper();
	return ZR.runScript(params);
}



async function addKeyPair(next){

	const keyPair = await generateAppCredentials(this.title);
	const _publicKey = keyPair[this.title].keypair.public_key;

	this.publicKey = _publicKey;

	console.log(this);


	next();


}

function preventMutation(doc, next){
	throw new Error('This document can no longer be changed');
		return;
}




InstanceSchema.pre('save',addKeyPair);
InstanceSchema.pre('deleteOne',() => preventMutation(doc, next));
InstanceSchema.pre('updateOne',() => preventMutation(doc, next));
InstanceSchema.pre('remove',() => preventMutation(doc, next));

const Instance = mongoose.model('Instance', InstanceSchema);

module.exports = Instance;

