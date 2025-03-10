var mongoose = require('mongoose');
// yaha humna mongoose library import kiya iska vajah se schema define karta hai or mongodb databse ka sath jorta hai

var Schema = mongoose.Schema;

//schema kya hota hai?
//Schema ek class hota hai jo humara model define karta hai
//is schema ke madhyam se hum apne collection ka schema define karte hai
//jaise ki collection name, field name, field type, field validation etc


var userSchema = new Schema({
    unique_id: { type: Number, unique: true },  // Ensuring uniqueness
    email: { type: String, required: true, unique: true },  // Required & unique
    username: { type: String, required: true },  // Required field
    password: { type: String, required: true },  // Required field
    passwordConf: { type: String, required: true },  // Required field
    
    // Learning Path Progress Tracking
    learningPath: { type: String, default: "" },

    progress: {
        contentRead: { type: Number, default: 0 },
        questionsSolved: { type: Number, default: 0 }
    },
    checkedContent: [String], // Store IDs of checked content
    checkedQuestions: [String], // Store IDs of checked questions

    // Additional fields for profile page
    mobile: { type: String, default: "" }, // User's mobile number
    college: { type: String, default: "" }, // User's college name
    currentCourse: { type: String, default: "" }, // User's current course
    yearOfGraduation: { type: String, default: "" }, // Year of graduation
    courseSelected: { type: String, default: "" }, // Course selected by the user
    timePeriod: { type: String, default: "" }, // Time period for the course
    photo: { type: String, default: "default-profile.png" } // Path to the user's profile photo
}, { timestamps: true });
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