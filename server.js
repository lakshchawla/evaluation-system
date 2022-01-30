const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const req = require('express/lib/request');
const app = express();

mongoose.connect(
    "mongodb+srv://lakshay:lakshay@cluster0.as40i.mongodb.net/job-application-database", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const userLoginSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const admins = mongoose.model('admins', userLoginSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    admins.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new localStrategy(function(username, password, done) {
    admins.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });

        bcrypt.compare(password, user.password, function(err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: 'Incorrect password.' }, console.log("Incorrect Password"));

            return done(null, user);
        });
    });
}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}

// ROUTES
app.get('/', (req, res) => {
    res.render("index", { title: "Home" });
});

app.get('/about', (req, res) => {
    res.render("about");
})

app.get('/learn-more', (req, res) => {
    res.render("learnMore");
})

app.get('/priority-applicant', (req, res) => {
    res.render("priorityApplicant");
})

app.get('/resume-display', (req, res) => {
    res.render("resumeDisplay");
})

app.get('/success', (req, res) => {
    res.render("success");
})

app.get('/login', isLoggedOut, (req, res) => {
    const response = {
        title: "Login",
        error: req.query.error
    }

    res.render('login', response);
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login?error=true',
    successRedirect: '/admin-dashboard',
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// bcrypt.genSalt(10, function (err, salt) {
// 	if (err) return next(err);
// 	bcrypt.hash("pass", salt, function (err, hash) {
// 		if (err) return next(err);

// 		const newAdmin = new admins({
// 			username: "admin",
// 			password: hash
// 		});

// 		newAdmin.save();

// 	});
// });

/****************************************************************************************************************************************************/

var multer = require('multer');
var fs = require('fs');
var path = require('path');

var imageSchema = new mongoose.Schema({
    First_Name: String,
    Last_Name: String,
    Contact: String,
    Date_of_Birth: Date,
    Gender: String,
    Email: String,
    City: String,
    State: String,
    Pincode: String,
    img: {
        data: String,
        contentType: String
    }
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, 'pdf' + '-' + Date.now() + '.pdf')
    }
});

var upload = multer({ storage: storage });

var candDetailsModel = new mongoose.model('candidate-details', imageSchema);

app.get('/admin-dashboard', isLoggedIn, (req, res) => {
    candDetailsModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('admin-dashboard', { items: items });
        }
    });
});

app.get('/get-hired', (req, res) => {
    res.render('profile');
})

app.get('/downloadFile/:reqSite', function(req, res) {
    var file = path.join(__dirname + '/uploads/' + req.params.reqSite);

    res.download(file, function(err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
});

//Details Post Request
app.post('/upload', upload.single('resume'), (req, res, next) => {
    // console.log(path.join(__dirname + '/uploads/' + req.file.filename + '.pdf'));
    var obj = {
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        Contact: req.body.Contact,
        Date_of_Birth: req.body.Date_of_Birth,
        Gender: req.body.Gender,
        Email: req.body.Email,
        City: req.body.City,
        State: req.body.State,
        Pincode: req.body.Pincode,
        img: {
            data: req.file.filename,
            contentType: 'application/pdf'
        }
    }

    candDetailsModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            item.save();
            res.render("success");
        }
    });
});


app.listen(3000, () => {
    console.log("Listening on port 3000");
});