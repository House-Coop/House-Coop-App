/*
*
*
* Constants
*
*
*/

const constants = {

	NODE_ENV: process.env.NODE_ENV,

	// Voting terms
	VOTING_TERM_WEEK: 1000 * 60 * 60 * 24 * 7, // 1 week
	VOTING_TERM_DAY: 1000 * 60 * 60 * 24, // 1 day
	VOTING_TERM_TEST: 1000 * 60 * 2, // 2 minutes

	// Possible statuses of articles
 	ARTICLE_STATUS_DRAFT : 1,
	ARTICLE_STATUS_PENDING : 2,
	ARTICLE_STATUS_REJECTED : 3,
	ARTICLE_STATUS_ADOPTED : 4,

	// Majority models
	MAJORITY_SIMPLE : 1,
	MAJORITY_CONSENSUS : 2,

	// Vote status
	VOTE_STATUS_PENDING : null,
	VOTE_STATUS_WITHELD : 0,
	VOTE_STATUS_NAY : -1,
	VOTE_STATUS_YAY : 1,

	// User privilege levels
	USER_PRIVILEGE_ADMIN : 10,
	USER_PRIVILEGE_FOUNDER : 9,
	USER_PRIVILEGE_BOARD: 8,
	USER_PRIVILEGE_MEMBER : 7,
	USER_PRIVILEGE_COACH : 6,
	USER_PRIVILEGE_PARTNER : 5,
	USER_PRIVILEGE_FINANCIER : 4,
	USER_PRIVILEGE_APPLICANT_MEMBER : 3,
	USER_PRIVILEGE_APPLICANT_COACH :  2,
	USER_PRIVILEGE_APPLICANT_PARTNER : 1,
	USER_PRIVILEGE_ASPIRANT :  0,
	USER_PRIVILEGE_VISITOR : -1,

	//SESSION
	SESSION_SECRET : process.env.SESSION_SECRET || "SwFMWzdI9wWdNkPuEXI730sdYkYU4DjWrFIyzI3z",
	SESSION_NAME: "eq_id",
	SESSION_LIFETIME: 1000 * 60 * 60 * 7,

	//SSL LOCAL
	SSL_CERT_KEY : "./security/local-key.pem",
	SSL_CERT : "./security/local.pem",
	SSL_PORT : 443,

	//MONGO LOCAL

	MONGO_SERVER:"mongodb://127.0.0.1:27017",
	MONGO_PORT:"27017",
	MONGO_DB:"equitable_os",

	//STUB
    keypairAdmin:{     
    	"public_key":  process.env.ADMIN_PUBLIC_KEY,
    	"private_key": process.env.ADMIN_PRIVATE_KEY
    },
    zenroomSettings: {
	    "curve": "goldilocks",
        "encoding": "url64",
        "version": "1.0.0+4f64c96",
        "scenario": "simple"
	}

}

module.exports = constants;
