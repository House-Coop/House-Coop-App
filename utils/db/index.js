var CONST = require('../../constants');

//Import the mongoose module
let mongoose = require('mongoose');


let mongoDB = process.env.MONGODB_URI || CONST.MONGO_SERVER + ":" + CONST.MONGO_PORT + "/" + CONST.MONGO_DB;	



module.exports.db = async function(){

	await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
	let db = mongoose.connection;
	
	mongoose.set('useCreateIndex', true);

	//Bind connection to error event (to get notification of connection errors)
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));

	return db;

}()

// module.exports = db;