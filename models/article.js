const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LockSchema = require('./lock');
const CONST = require('../constants');
const User = require('../models/user.js');

/* 
*
*
* Lock schema subdoc
* ------------- 
* Once a vote is called on an article, the lock is applied
* We attempt to develop this subdoc as agnostic as possible.
* 
*
*/

const ArticleSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Please provide a title'],
		immutable: checkImmutability
	},
	description: {
		type: String,
		required: [true, 'Please provide a body'],
		immutable: checkImmutability
	},
	attachment: [{
		type: String,
		immutable: checkImmutability
	}],
	authors: [{type: Schema.Types.ObjectId, ref: 'User'}],
	category: {type: Schema.Types.ObjectId, ref: 'Category'},
	lock:  LockSchema
},  { timestamps: true, strict: "throw" });

ArticleSchema.set('toObject', { virtuals: true });
ArticleSchema.set('toJSON', { virtuals: true });

ArticleSchema.virtual('status').get(function(){
	//no lock? stil editing
	if(!this.lock) return CONST.ARTICLE_STATUS_DRAFT;
	//lock, but no finalStatus? still in vote
	if(!this.lock.finalStatus) return CONST.ARTICLE_STATUS_PENDING;
	//lock and finalStatus set? the vote is done.
	return this.lock.finalStatus;
})

/*
 * The findOneAndUpdate() method of mongoose doesn't pass the doc to the immutable function
 * Therefore we improvise a method around .save
 * see: https://github.com/Automattic/mongoose/issues/8385
 */

ArticleSchema.statics.findOneAndUpdateSafely = function(condition, update, options){

	//Note: we omit the options at this stage, options.new, options.updates
	return this.findOne(condition)
	.then(doc => {
		Object.assign(doc, update); //rudementary upsert
		return doc.save();
	});
}
ArticleSchema.statics.findOneByVoteId = function(condition, options){

	return this.findOne(condition);
}

/*
 * This method applies a lock on the file.
 */

ArticleSchema.statics.findOneAndApplyLock = async function(condition, update, options){
	
	console.log(">> Article > appying lock; update",update, condition);
	
	return this.findOne(condition)
	.then(async function(doc){

		doc.lock = LockSchema;

		try{
			
			const allMembers = await User.find({privilege: {$gte: CONST.USER_PRIVILEGE_MEMBER},publicKey: { $ne: '0' }},'publicKey');
			
			return doc.lock.openVote(update, allMembers)
			.then(() => {
				return doc.save();
			})
		
		}
		catch(err){
			return new Error(err);
		}

	})

}

ArticleSchema.methods.performTally = function(){
	console.log("performing a tally on ",this);
}

ArticleSchema.pre('save',() => preventMutation(doc, next));
ArticleSchema.pre('deleteOne',() => preventMutation(doc, next));
ArticleSchema.pre('updateOne',() => preventMutation(doc, next));
ArticleSchema.pre('remove',() => preventMutation(doc, next));

/************* 
*
*
* Functions 
* ------------- 
* Helper functions to warrant immutability
* 
*
*************/

function preventMutation(doc, next){
	if(doc.lock){
		//some logic that can be applied.
		if(doc.lock.finalstatus){
			console.log(">> this doc can not be changed",doc._id);
			//in this case, no changes can be made
			throw new Error('This document can no longer be changed');
			return;
		}
	}
	next();
}

function checkImmutability(doc){
	return (doc.lock !== undefined);
}




module.exports = mongoose.model('Article',ArticleSchema);


