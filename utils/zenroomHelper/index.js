/**
 * Zenroom Helper
 *
 * Make Zenroom script-calls Thennable and responses objects (or errors)
 *
 *
 * @return {Promise} object - zenroom output
 */

const zenroom = require('zenroom').default;

const DEFAULT_OPTS = {
	verbosity: 1
}


function ZenroomHelper(){ /* constructor goes here */ }

/**
 * Function: generateHash
 *
 * @param {Object} _object - Object to be hashed
 * @param {Object} algorithm - Hasing algorithm, default: SHA256
 *
 * @return {String} Hashed object
 */





/**
 * Function: runLuaScript
 * for reference: https://dev.zenroom.org/lua/
 *
 * @param {Object} params - dictionary of params.
 * @param {String} params.script - a Lua script
 *
 * @return {Object} response - output of zenroom, formatted as Object
 */


ZenroomHelper.prototype.runLuaScript = function(params){

	
	const script = params.script || undefined;
	
	return new Promise((resolve, reject) => {

		//our custom print function
		let __buffer = []		
		const _printFunction = msg => { __buffer.push(msg) };

		//setting options, extending DEFAULT_OPTS
		const opts = Object.assign(
			{}, 
			DEFAULT_OPTS, 
			{
				print: _printFunction
			});
		
		zenroom.init(opts)

		zenroom
		.script(script)
		.success(() => {

				let responseObj = {};

				try{
					//construct response from buffer
					responseObj = JSON.parse(__buffer.join(" "));
				}
				catch(err) {
					//in case of an error, we assume the output was not a JSON parseable string.
					responseObj = {output: __buffer.join(" ")}
				}

				//clear the buffer for the next call 
				__buffer = [];

				//reset zenroom for the next call
				zenroom.reset()

				//and resolve the promise
				return resolve(responseObj);

			})
			.error(() => {

				//construct a meaningfull error
				const error = new Error("Zenroom Error" + __buffer.join(" "));

				//clear the buffer for the next call
				__buffer = [];

				//and reject the promise
				reject(error);
			})
		.zenroom_exec()

	})	
}

/**
 * Function: runScript
 * for reference: https://dev.zenroom.org/zencode/
 *
 * @param {Object} params - dictionary of params.
 * @param {String} params.script - a Zencode contract
 * @param {Object} params.conf - (see zenroom documentation)
 * @param {Object} params.keys - (see zenroom documentation)
 * @param {String} params.data - (see zenroom documentation)
 *
 * @return {Object} response - output of zenroom, formatted as JSON object
 */


ZenroomHelper.prototype.runScript = function(params){

	//validating the params 
	const script = params.script || "";
	const keys = params.keys || {};
	const data = params.data || "";
	const conf = params.conf || {}; 

	//create a promise to allow zenroom to do it's work and not block exec
	return new Promise((resolve, reject) => {

		//our custom print function
		let __buffer = []		
		const _printFunction = msg => { __buffer.push(msg) };
 
 		//setting options, extending DEFAULT_OPTS
		const opts = Object.assign(
			{}, 
			DEFAULT_OPTS, 
			{
				print: _printFunction
			});
		
		zenroom.init(opts)

		zenroom
			.keys(keys)
			.data(data)
			.conf(conf)
			.script(script)
			.print(_printFunction)
			.success(() => {

				let responseObj = {};

				try{
					//construct response from buffer
					responseObj = JSON.parse(__buffer.join(" "));
				}
				catch(err) {
					//in case of an error, reject promise
					return reject(err)
				}

				//clear the buffer for the next call 
				__buffer = [];

				//reset zenroom for the next call
				zenroom.reset()

				//and resolve the promise
				return resolve(responseObj);

			})
			.error(() => {

				//construct a meaningfull error
				const error = new Error("Zenroom Error" + __buffer.join(" "));

				//clear the buffer for the next call
				__buffer = [];

				//and reject the promise
				reject(error);
			})
			.zencode_exec()
			//Note: don't call reset after zencode_exec(), as it will kill print function, instead it's bundled in the success header
	})

}

module.exports = ZenroomHelper;
