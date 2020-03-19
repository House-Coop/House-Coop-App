const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')
const bcrypt = require('bcryptjs')

const CONST = require('../constants');


const UserSchema = new Schema({
	username: {
	    type: String,
	    required: true,
	    minlength: 3,
	    maxlength: 50,
	    validate: [
		    {
		    	validator: _username => User.doesNotExist({ _username }),
		    	message: "Username already exists"
		    },
		    {
		    	validator: _username => _username.length > 2 && _username.length < 255,
		    	message: "A username should be between 3 and 255 characters"
		    }
	    ]
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true,
		validate: [
			{
				validator: _email => User.doesNotExist({ _email }),
	        	message: "Email already registered"            
	        },
	        {
				validator: _email => validator.isEmail(_email),
	        	message: "Not a valid email"            
	        }
        ]
	},
	password: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 255,
		validate: [
			{ 
				validator: _password => !validator.isEmpty(_password),
				message: 'Please enter a password.'
			},
			{ 
				validator: _password => !validator.equals(_password.toLowerCase(),"password"),
				message: 'Password is invalid!'
			},
			{ 
				validator: _password => !validator.contains(_password.toLowerCase(), "password"),
				message: 'Password should not contain password!'
			}
		] 
	},
	publicKey: String,
	privilege: {
		type: Number,
		default: CONST.USER_PRIVILEGE_ASPIRANT,
		min: CONST.USER_PRIVILEGE_VISITOR,
		max: CONST.USER_PRIVILEGE_ADMIN,
		// immutable: true // make this immutable again asap.
	},
	profileImg: String,
	profileThumb: String,
	description: {
		type: String,
		minlength: 0,
		maxlength: 1024,
		 
	}
},  { timestamps: true, strict: "throw" });


UserSchema.pre('save', function(next){
    const user = this
    if(user.isModified('password')){
        user.password = bcrypt.hashSync(user.password, 10)
    }
    next()
})

UserSchema.statics.doesNotExist = async function (field) {
	return await this.where(field).countDocuments() === 0;
};
UserSchema.statics.findOneAndUpdateSafely = function(condition, update, options){

	//Note: we omit the options at this stage, options.new, options.updates
	return this.findOne(condition)
	.then(doc => {
		Object.assign(doc, update); //rudementary upsert
		return doc.save();
	});
}
UserSchema.methods.comparePasswords = function (password) {
	// console.log(">>",bcrypt.hashSync(password, 10));
	return bcrypt.compareSync(password, this.password);
};
const User = mongoose.model('User', UserSchema);

module.exports = User;

