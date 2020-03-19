/**
* Ballot
*
* @param {String} public_key - Public key of voter
*
* @param {Number} article_id - id of the article
* @param {String} articleTitle - Title of the article
* @param {String} articleDescription - Description of the article
*
* @param {Number} vote_id - id of the vote
* @param {String} voteTitle - Title of the vote
* @param {String} voteDescription - Description of the vote
*
* @param {Date} dueDate - Due date of the vote
*
* @return {Object} Ballot - This can be stored in the database.
*/

console.warn(`
	Ballot >> This ballot module needs some TLC
	- Every ballot being generated makes proposal hash, this is overkill; hash should be passed to ballot
	`);

const ZR = require('../zenroomHelper');
const _ = require('lodash');
const CONST = require('../../constants');

module.exports = Ballot;

function Ballot(params){
	
	//constructor
	this.payload = {
		proposal: {
			article_id: params.article_id || 0,
			articleTitle: params.articleTitle || "none given",
			articleDescription: params.articleDescription || "none given",
			vote_id: params.vote_id || 0,
			voteTitle: params.voteTitle || "none given",
			voteDescription: params.voteDescription || "none given",
			dueDate: new Date(new Date() + CONST.VOTING_TERM_WEEK)
		},
		myVote : CONST.VOTE_STATUS_PENDING,
		proposalPublicKey: CONST.keypairAdmin.public_key
	}
	
	this.public_key = params.public_key;

	//then we prep the scripts to be run
	this.contract = this.populateContract();
	this.proposalHashScript = this.populateProposalHashScript();
}

Ballot.prototype.populateContract = function(){
	return {
		"script" : 
			`Rule check version 1.0.0
			Scenario 'simple': Admin encrypts a message for Voter
			Given that I am known as 'Admin'
			and I have my valid 'keypair'
			and I have a valid 'public key' from 'Voter'
			When I write '${ objToBase64(this.payload) }' in 'message'
			and I write '${ this.voteTitle }' in 'header'
			and I encrypt the message for 'Voter'
			Then print the 'secret message'`,
		"keys": {
			"Admin": {
				"keypair": CONST.keypairAdmin
			},
			"Voter":{
				"public_key": this.public_key
			}
		},
		"data": {
			
		},
		"conf": CONST.zenroomSettings

	}
}
Ballot.prototype.populateProposalHashScript = function(){
	return {
		script: 
			`proposal = str("${ objToBase64(this.payload.proposal)  }")
			hsh = HASH.new("sha256")
			out = {}
			out.hash = hsh:process(proposal)
			print(JSON.encode(out))`
	}
}

Ballot.prototype.createProposalHash = function(){
	//start a new zenroom instance
	const zr = new ZR();
	//and run the ProposalHashScript to produce the 
	return zr.runLuaScript(this.proposalHashScript)
}
Ballot.prototype.renderBallot = function(){
	//start a new zenroom instance
	const zr = new ZR();
	//and run the contract script
	return zr.runScript(this.contract)	
}
Ballot.prototype.generate = async function(){
	try{
		const proposalHash = await this.createProposalHash();
		console.log(">>ballot > proposalhash",proposalHash);
		const _ballot = await this.renderBallot();
		return {
			publicKey: this.public_key,
			proposalHash: proposalHash.hash,
			ballot: _ballot
		}
	}
	catch(err){
		throw new Error(err);
	}
}



//some utils to help prepare the JSON objects for encryption / encoding
function objToString(_obj){ 
	return JSON.stringify(_obj);
}
function strToBase64(_str){
	return Buffer.from(_str).toString('base64');
}
function objToBase64(_obj){
	return strToBase64(objToString(_obj));
}


