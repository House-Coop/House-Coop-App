var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MilestoneSchema = new Schema({
	title: {
		type: String,
		required: [true, "Please provide a title"]
	},
	description: String,
	dueDate: {
		type: Date,
		// immutable: true,
	},
	articles: [{type: Schema.Types.ObjectId, ref: 'Article'}],
},  { timestamps: true });

module.exports = mongoose.model('Milestone',MilestoneSchema);