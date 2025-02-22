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

router.post('/login', async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.send({ "Success": "This Email is not registered!" });
        }

        if (user.password !== req.body.password) {
            return res.send({ "Success": "Wrong password!" });
        }

        req.session.userId = user.unique_id;

        // Initialize progress if missing
        if (!user.progress) {
            user.progress = { contentRead: 0, questionsSolved: 0 };
            await user.save();
        }

        // Send progress data to the frontend
        res.send({
            "Success": "Success!",
            "redirectUrl": user.learningPath ? '/codesphere' : '/maindashboard',
            "progress": user.progress  // Send progress to frontend
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ "Error": "Internal Server Error" });
    }
});
router.get('/getProgress', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send({ "Error": "User not logged in!" });
        }

        const user = await User.findOne({ unique_id: req.session.userId });
        if (!user) {
            return res.status(404).send({ "Error": "User not found!" });
        }

        res.send({ 
            progress: user.progress || { contentRead: 0, questionsSolved: 0 },
            checkedContent: user.checkedContent || [],
            checkedQuestions: user.checkedQuestions || []
        });
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).send({ "Error": "Internal Server Error" });
    }
});


//profile page pe jana ho tho yeh route use karega
//isme apan check karenge ki user login hai ya nahi
//agar login hai toh uska data profile page pe dikhayenge
//agar login nahi hai toh use login page pe redirect karenge
//
router.get('/maindashboard', async function (req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        let user = await User.findOne({ unique_id: req.session.userId });

        if (!user) {
            return res.redirect('/');
        }

        console.log("Session Progress:", req.session.progress);
        
        return res.render('dashboard', { 
            "name": user.username,
            "learningPath": user.learningPath,
            "progress": req.session.progress || { contentRead: 0, questionsSolved: 0 }
        });

    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return res.redirect('/');
    }
});


router.post('/select-learning-path', function (req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if user not logged in
    }

    User.findOne({ unique_id: req.session.userId }, function (err, user) {
        if (err) {
            console.log(err);
            return res.json({ "Error": "Database error" });
        }
        if (!user) {
            return res.json({ "Error": "User not found" });
        }

        user.learningPath = req.body.learningPath; // ✅ Updating the field
        user.save(function (err) {
            if (err) {
                console.log(err);
                return res.json({ "Error": "Failed to save learning path" });
            }
            return res.redirect('/codesphere'); // ✅ Redirect to updated page
        });
    });
});


router.get('/codesphere', function (req, res, next) {
	console.log("codesphere");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('codespherepage.ejs', {"name":data.username,"learning":data.learningPath});
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
router.get("/ai", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if user not logged in
    }

    try {
        let user = await User.findOne({ unique_id: req.session.userId });

        if (!user) {
            return res.redirect('/login');
        }

        // ✅ Ensure progress exists in database, initialize if missing
        if (!user.progress) {
            user.progress = { contentRead: 0, questionsSolved: 0 };
            await user.save(); // 🛠️ Save to MongoDB
        }

        console.log("User Progress Data:", user.progress); // Debugging output

        res.render("ml.ejs", { progress: user.progress });
    } catch (error) {
        console.error("Error fetching AI progress:", error);
        res.redirect('/login');
    }
});

router.post('/updateProgress', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send({ "Error": "User not logged in!" });
        }

        const { contentRead, questionsSolved, checkedContent, checkedQuestions } = req.body;

        // Update the user's progress in MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { unique_id: req.session.userId },
            { 
                $set: { 
                    "progress.contentRead": contentRead,
                    "progress.questionsSolved": questionsSolved,
                    "checkedContent": checkedContent,
                    "checkedQuestions": checkedQuestions
                }
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).send({ "Error": "User not found!" });
        }

        res.send({ "Success": "Progress updated successfully!", progress: updatedUser.progress });
    } catch (error) {
        console.error("Progress update error:", error);
        res.status(500).send({ "Error": "Internal Server Error" });
    }
});




//logout page pe jana ho tho yeh route use karega

router.get('/logout', function (req, res, next) {
    console.log("logout")
    if (req.session) {
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