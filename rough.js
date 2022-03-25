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

const userLoginSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const userSchema = new mongoose.Schema({
  uid: String,
  loginSchema:{
    username: String,
    password: String,
  },
  certificateSchema:{
    title: String,
    link: String,
  }
})

const users = mongoose.model("users", userSchema);

const admins = mongoose.model("admins", userLoginSchema);

// Middleware
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

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  admins.findById(id, function (err, user) {
    done(err, user);
  });
});

const certificateSchema = new mongoose.Schema({
  title: String,
});

const certificate = mongoose.model("certificate", certificateSchema);

passport.use(
  new localStrategy(function (username, password, done) {
    admins.findOne({ username: username }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect username." });

      bcrypt.compare(password, user.password, function (err, res) {
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
app.get("/", (req, res) => {
  certificate.find({}, (err, certificates) => {
    res.render("profile", {
      certificates: certificates,
    });
  });
});

app.get("/login", (req, res) => {
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

app.get("/student-registration", (req, res) => {
  res.render("./registration_forms/-regn");
});

app.get("/certificate-registration", (req, res) => {
  res.render("./registration_forms/certificate");
});

app.post("/certificate-registration", (req, res) => {
  var newCertificate = new certificate({
    title: req.body.credentialName,
  });

  newCertificate.save();

  res.render("success_page");
});

app.get("/admin_pass", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash("pass", salt, function (err, hash) {
      if (err) return next(err);

      const newAdmin = new admins({
        username: "admin",
        password: hash,
      });

      newAdmin.save();
    });
  });
});

/****************************************************************************************************************************************************/

var port = process.env.PORT || "3000";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});
