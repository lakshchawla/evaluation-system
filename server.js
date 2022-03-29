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
  uid: { type: String },
  category: String,
  loginSchema: {
    password: String,
  },
  profile: {
    name: String,
    cumail: String,
    email: String,
    section: String,
  },
  certificateSchema: [
    {
      title: String,
      source: String,
      aprooval: Boolean,
    },
  ],
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

let currUser;

passport.use(
  new localStrategy(function (username, password, done) {
    users.findOne({ uid: username }, function (err, user) {
      currUser = username;
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
  users.findOne({ uid: currUser }, (err, user) => {
    res.render("profile", {
      user: user,
    });
  });
});

app.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error,
  };

  res.render("login", response);
});

app.get("/certificate-registration", isLoggedIn, (req, res) => {
  users.findOne({ uid: currUser }, (err, user) => {
    res.render("./registration_forms/certificate", {
      user: user,
    });
  });
});

app.post("/certificate-registration", (req, res) => {
  users.findOneAndUpdate(
    { uid: currUser },
    {
      $push: {
        certificateSchema: {
          title: req.body.credentialName,
          source: req.body.credentialSource,
        },
      },
    },
    (error, success) => {
      if (error) {
        console.log(error);
      } else {
        res.render("success_page");
      }
    }
  );
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

// Student Sign up
app.get("/sign-up", isLoggedOut, (req, res) => {
  res.render("signup");
});

app.post("/sign-up", (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      if (err) return next(err);

      const newUser = new users({
        uid: req.body.uid,
        category: req.body.category,
        loginSchema: {
          password: hash,
        },
        profile: {
          name: req.body.name,
          section: req.body.section,
        },
      });

      newUser.save();
    });
  });

  res.render("success_page");
});

// Establishing Port Connection
var port = process.env.PORT || "3000";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});
