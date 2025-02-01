var express = require('express');
var router = express.Router();
var User = require('../models/user');

//express routing and middleware framework provide karta hai
//ye router use karte hai

//router handle route

//User import mongoose model taki voh user ke sath interact kar sake

router.get('/', function (req, res, next) {
	return res.render('about.ejs');
});

//// when a user visits the homepage (/), the server responds by sending the rendered HTML of the about.ejs file


router.get('/index', function (req, res, next) {
	return res.render('index.ejs');
});

// when a user visits the homepage (/index), the server responds by sending the rendered HTML of the index.ejs file


//HANDLES USER REGISTRATION

router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

//login page pe jana ho tho yeh route use karega
router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});
//data page pe jana ho tho yeh route use karega
router.get('/data', function (req, res, next) {
	return res.render('data.ejs');
});
//login page pe  ho tho yeh route use karega
//isma apan phele check karenge ki user exist karta hai ya nahi
//agar exist karta hai toh uska password check karenge
//agar password match karta hai toh user ko login kar denge

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});
//profile page pe jana ho tho yeh route use karega
//isme apan check karenge ki user login hai ya nahi
//agar login hai toh uska data profile page pe dikhayenge
//agar login nahi hai toh use login page pe redirect karenge
//
router.get('/codesphere', function (req, res, next) {
	console.log("codesphere");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('codespherepage.ejs');
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get("/ide", (req, res) => {
    res.render("ide");
});

router.get("/dsa", (req, res) => {
    res.render("dsa");
});

router.get("/questions", (req, res) => {
    res.render("questions");
});



//logout page pe jana ho tho yeh route use karega

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

// yaha se forget password hai

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;