/**
 * Converter utils
 *
 * a bunch of functions to convert objects and strings back and forth
 *
 * @return {number} b - Bar
 */


//some utils to help prepare the JSON objects for encryption / encoding
module.exports.objToString = function(_obj){ 
	return JSON.stringify(_obj);
}
module.exports.strToBase64 = function(_str){
	return Buffer.from(_str).toString('base64');
}
module.exports.objToBase64 = function(_obj){
	return this.strToBase64(this.objToString(_obj));
}

/**
 * Decoding
 */

module.exports.base64ToString = function(_base64){
	const _buffer = new Buffer(_base64, 'base64');
	return _buffer.toString();
}
module.exports.stringToObj = function(_str){
	try{
		return JSON.parse(_str);
	}
	catch(err){
		return {str: _str, err: err};
	}
}
module.exports.base64ToObj = function(_base64){
	return this.stringToObj(this.base64ToString(_base64));
}
