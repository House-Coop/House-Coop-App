const mongoose = require('mongoose');
// const zenroomHelper = require('../utils/zenroomHelper')
const Schema = mongoose.Schema;
const schedule = require('node-schedule');


const CONST = require('../constants');
const Ballot = require('../utils/ballot')
const ZR = require('../utils/zenroomHelper');
/**
*
*
*	tweak this to speed up tally. if set to 0, dueDate is respected.
*
 */
const timeToTally = 0; //5*60*1000;
/**
*
*
*
*
*/

function scheduleTally(date, _parent){

	let dueDate = (timeToTally > 0) ? new Date(Date.now() + timeToTally) : new Date(date);
	if(dueDate <= Date.now()) dueDate = new Date(Date.now() + 24*60*60*1000);


	console.log("\n\n\n SCHEDULED TALLY FOR:",dueDate,"\n\n\n");

	const scheduledTalley = schedule.scheduleJob(dueDate, function(){
		console.log("time to trigger", _parent._id);
		performTally(_parent._id);
	})
			
	return scheduledTalley;

}

function performTally(_id){

	const Article = require('./article.js');

	let tallyOutcome = {
			ballotsIssued: 0,
			votesCast: 0,
			yay: 0,
			nay: 0,
			withheld: 0,
			majorityMet: false, //50%
			thresholdMet: false //50%
		}
	
	Article.findOne({_id: _id})
	.then(async (doc) => {

		
		//first we find the signedBallots
		const signedBallots = doc.lock.signedBallots;
		let outcomes = [];

		//then we decrypt each signedBallot and produce a series of promises
		signedBallots.forEach(async (ballot) => {
			const script = `
				Rule check version 1.0.0
				Scenario 'simple': APP decrypts the message from USER
				Given that I am known as 'APP'
				and I have my valid 'keypair'
				and I have a valid 'public key' from 'USER'
				and I have a valid 'secret message'
				When I decrypt the secret message from 'USER'
				Then print as 'string' the 'message'
				and print as 'string' the 'header' inside 'secret message'
				`
			const keys = {
				public_key : {
					USER:  ballot.publicKey
				},
				zenroom : ballot.signedBallot.zenroom,
				APP: {
					keypair: {
						public_key: CONST.keypairAdmin.public_key,
						private_key: CONST.keypairAdmin.private_key
					}
				}
			};

			const data = JSON.stringify(ballot.signedBallot);

			try{
				const zr = new ZR();
				outcomes.push(zr.runScript({script, keys, data}));
			}
			catch(err){ console.log(">> THE TALLY ERRORS",err) }
		})

		//then we proceed when all promises are resolved 

		Promise.all(outcomes)
		.then(results => {
			// console.log(">> THE TALLY OUTCOMES",results);
			results.forEach(result => {
				console.log(">>TALLY RESULT: ",Object.keys(result),result['message']);
				const proposal = JSON.parse(result['message']);
				if(proposal.myVote == -1){
					tallyOutcome.nay++;
				}
				if(proposal.myVote == 1){
					tallyOutcome.yay++;
				}
				if(proposal.myVote == 0){
					tallyOutcome.withheld++;
				}
			})
			tallyOutcome.ballotsIssued 	= doc.lock.ballots.length;
			tallyOutcome.votesCast	   	= doc.lock.signedBallots.length;
			tallyOutcome.thresholdMet	= ((tallyOutcome.votesCast / tallyOutcome.ballotsIssued) > .5);
			tallyOutcome.majorityMet	= ((tallyOutcome.yay / tallyOutcome.votesCast) > .5);

			doc.lock.finalStatus = (tallyOutcome.thresholdMet && tallyOutcome.majorityMet) ? CONST.ARTICLE_STATUS_ADOPTED : CONST.ARTICLE_STATUS_REJECTED;
			doc.lock.tallyOutcome = tallyOutcome;
			
			return doc.save();

		})
		
	})
	.catch(err => {
		console.log(">> THE TALLY ERRORS",err)
	})
}	




/**************
* 
* 
* 	Lock
* 
* 
**************/



const LockSchema = 	new Schema({
	title: {
		type: String,
		// immutable: true,
	},
	description: {
		type: String,
		// immutable: true,
	},
	finalStatus: {
		type: Number,
		min: CONST.ARTICLE_STATUS_REJECTED,
		max: CONST.ARTICLE_STATUS_ADOPTED
	},
	author: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	majority: {
	    type: Number,
	    default: CONST.MAJORITY_SIMPLE,
	    min: CONST.MAJORITY_SIMPLE, 
	    max: CONST.MAJORITY_CONSENSUS,
			    // immutable: true,
	},
	dueDate: {
		type: Date,
		// immutable: true,
	},
	tally: {
		type: Schema.Types.Mixed,
		// immutable: true,
	},
	tallyOutcome:{
		type: Schema.Types.Mixed
	},
	ballots: [{
		type: Schema.Types.Mixed
	}],
	signedBallots: [{
		type: Schema.Types.Mixed
	}],
	articleHash: {
		type: String,
		// immutable: true,
	}
},  { timestamps: true });


LockSchema.methods.openVote = openVote;


/*
 * 	Functions
 */

function throwError(msg){
	console.log("\n\n\n Error thrown ", msg);
	return Promise.reject(Error(msg));
}



/**
 * Opening vote
 *
 * @param {Object} update - All meta fields added to the lock
 * @param {Array} members - An array of members public_keys.
 *
 * @return {Object} populated lock Schema
 */



async function openVote(_update, _members){

	console.log(">> Lock > triggered");

	let members = _members || [];

	//when the vote is opened, we start with setting the meta info
	// update.title = _update.title || 'This article is now called into vote';
	// update.description = _update.description || 'The content of this article can no longer be edited.';

	//Make sure we save it too :-)
	this.title = _update.title;
	this.description = _update.description;
	this.majority = _update.majority;
	this.dueDate = _update.dueDate || new Date(new Date() + CONST.VOTING_TERM_TEST);
	this.tally = scheduleTally(this.dueDate, this.parent());	
		
	//generate ballots
	const self = this; //assign this to self, because try breaks scope.

	try{

		for (var i = 0; i < members.length; i++) {
			
			const params = {
				articleTitle : self.parent().title,
				articleDescription:  self.parent().description,
				voteTitle: _update.title,
				voteDescription: _update.description,
				dueDate: _update.dueDate,
				public_key: members[i].publicKey
			}

			// console.log("getting up to here",members[i], params);
			// console.log("\n\n Generating a ballot for ",members[i]);

			const ballot = new Ballot(params);
			const ballotEncrypted = await ballot.generate();
			self.ballots.push(ballotEncrypted);

		}

		console.log("\n\n >>>>>>>> Done generating ballots <<<<<<<<");

		return await true;

	} 
	catch(err){
		console.log(err);
		throw new Error(">> Lock > broke while generating ballots ", err)
	}


}

module.exports = LockSchema;