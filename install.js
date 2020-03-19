console.log("\n\ House.coop Installer \n\n");

const dotenv = require('dotenv').config();

/**
 * Check if a keypair is present
 */

if(process.env.ADMIN_PUBLIC_KEY && process.env.ADMIN_PRIVATE_KEY){
	console.log(">> Keys are present, omit install procedure");
	process.exit(0);
	return
}

console.log(">> Keys are not present, run install procedure...");
console.log(">> Generating keypair");


const keygen_contract = `rule check version 1.0.0
Scenario 'simple': Create the keypair
Given that I am known as 'Admin'
When I create the keypair
Then print my data`

const ZR = require('./utils/zenroomHelper');
const zr = new ZR();

zr.runScript({script: keygen_contract})
.then((_keys) => {
	let keys = 'ADMIN_PUBLIC_KEY=' + _keys.Admin.keypair.public_key + "\n";
		keys +='ADMIN_PRIVATE_KEY=' + _keys.Admin.keypair.private_key;
		

	//now we got the keys, we append them to the .env file.
	const fs = require("fs");
	fs.readFile(".env", (err, data) => {
		if(err){
			console.log(">> Error when accessing .env file");
			process.exit(1);
		}
		fs.writeFile(".env",data + "\n" + keys, err => {
			if(err){
				console.log(">> Error when writing .env file");
				process.exit(1);
			}
			console.log(">> Succesfully generated keys and appended to .env file");
			process.exit(0);

		})

	})
	


})
.catch(err => {
	console.log(err);
})

/*


{ Admin:
   { keypair:
      { public_key:
         'u64:BHO8uGAvR8pRG_tzqpP8albO71brewd86WoUAJvxnXHVO6smgKWlleym6LTbRb3yrktezjbRnaRD-4_BaIJ8U018s-05B_wFAZMiNjnYBo5NAMjexkDeuxqsHW1C-8o-Q_GLtr9Y_fr1lXe-hbf6PZA',
        private_key:
         'u64:K203ClQzIdD_bfGZsn8UMlZ3A80Zgzl9KvcNrDF8x2-IdrcTcm46AVvthoH2jYVBKrdTbsl9U9w' } },
  zenroom:
   { curve: 'goldilocks',
     encoding: 'url64',
     version: '1.0.0+a7fab75',
     scenario: 'simple' } }


     */