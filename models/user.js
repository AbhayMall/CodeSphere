var mongoose = require('mongoose');
// yaha humna mongoose library import kiya iska vajah se schema define karta hai or mongodb databse ka sath jorta hai

var Schema = mongoose.Schema;

//schema kya hota hai?
//Schema ek class hota hai jo humara model define karta hai
//is schema ke madhyam se hum apne collection ka schema define karte hai
//jaise ki collection name, field name, field type, field validation etc


userSchema = new Schema( {

	
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String,
	learningPath: { type: String, default: "" }
}),
//jasa yaha humna ek blueprint tyaar kiya hai isma id , email etc liya hai
//orr sab string data type ka hai
//or passwordConf field ko bhi define kiya hai jo password field ki confirmation hai

User = mongoose.model('User', userSchema);
//yaha humne ek model define kiya hai jo humara collection ka schema hai
//is model ke madhyam se hum apne collection ka data insert, update, delete etc
//karte hai


module.exports = User;
//yaha humne ek module export kiya hai jo humara User model hai
//is module ko apne file mein import karke hum apne collection ka data access kar s
//kete hai