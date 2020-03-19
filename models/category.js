var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	title: {
		type: String,
		required: [true, "Please provide a title"]
	},
	description: String,
	image: {
		type: String,
		default: "/uploads/placeholder.jpg"
	},
	color: String
},  { timestamps: true });

module.exports = mongoose.model('Category',CategorySchema);