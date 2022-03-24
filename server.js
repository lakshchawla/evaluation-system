// Dependancies---------------------------------------------
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const app = express();



mongoose.connect(
  "mongodb+srv://lakshay:lakshay@cluster0.as40i.mongodb.net/uies_data",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);


//Midleware
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Schema-----------------------------------------------------
const userSchema = new mongoose.Schema({
  uid: String,
  category: String,
  loginSchema:{
    password: String,
  },
  profile:{
    cumail: String,
    email: String,
    section: String,

  },
  certificateSchema:{
    title: String,
    link: String,
    aprooval: Boolean,
  },
  verified: Boolean,
});

// Schema Constructor------------------------------------------
const users = mongoose.model("users", userSchema);


// Passport Js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  users.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new localStrategy(function (username, password, done) {
    users.findOne({ uid: username }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect username." });

      bcrypt.compare(password, user.loginSchema.password, function (err, res) {
        if (err) return done(err);
        if (res === false)
          return done(
            null,
            false,
            { message: "Incorrect password." },
            console.log("Incorrect Password")
          );

        return done(null, user);
      });
    });
  })
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}


// ROUTES
app.get("/", isLoggedIn, (req, res) => {
  // certificate.find({}, (err, certificates) => {
  //   res.render("profile", {
  //     certificates: certificates,
  //   });
  // });
  res.render("profile");
});

app.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error,
  };

  res.render("login", response);
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login?error=true",
    successRedirect: "/",
  })
);

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


// Signing up for admin directly---------------------------------------------------
app.get("/addAdmin", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash("pass", salt, function (err, hash) {
      if (err) return next(err);

      const newUser = new users({
        uid: "admin",
        loginSchema:{
          password: hash,
        },
      });

      newUser.save();
    });
  });
});

// Student Sign up
app.get("/sign-up", isLoggedOut, (req, res) => {

});

app.post("/sign-up", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      if (err) return next(err);

      const newUser = new users({
        uid: req.body.uid,
        category: req.body.category,
        loginSchema:{
          password: hash,
        },
      });

      newUser.save();
    });
  });
});

// Establishing Port Connection
var port = process.env.PORT || "3000";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});