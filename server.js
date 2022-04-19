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

const users = require("./src/module/userModel");


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
// const userSchema = new mongoose.Schema({
//   uid: { type: String },
//   category: String,
//   loginSchema: {
//     password: String,
//   },
//   profile: {
//     name: String,
//     cumail: String,
//     email: String,
//     section: String,
//   },
//   certificateSchema: [
//     {
//       title: String,
//       source: String,
//       aprooval: Boolean,
//     },
//   ],
//   verified: Boolean,
// });

// // Schema Constructor------------------------------------------
// const users = mongoose.model("users", userSchema);

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
            // res.render("error_page")
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

app.get("/mentor-dashboard", isLoggedIn, (req, res) => {
  users.findOne({ uid: currUser }, (err, user) => {
    res.render("dashboard", {
      user: user,
    });
  });
})

app.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error,
  };

  res.render("login", response);
});




// Certificate
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
        res.render("error_page");
      } else {
        res.render("success_page");
      }
    }
  );
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/error_page",
    successRedirect: "/",
  })
);

app.get("/error_page", function (req, res) {
  res.render("error_page");
});

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
          email: req.body.email,
          cumail: req.body.cumail,
          section: req.body.section,
          class: req.body.class,
          // New
          // profileImg: req.body.file,
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
  console.log("Server listening on port ", port);
});












// Profile iMAGE

var fs = require('fs');
var path = require('path');
require('dotenv/config');


// Step 5 - set up multer for storing uploaded files

var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
var upload = multer({ storage: storage });

var imgModel = require('./src/module/userModel');



app.get("/profile-upload", isLoggedIn, (req, res) => {
  users.findOne({ uid: currUser }, (err, user) => {
    res.render("./registration_forms/profileImage", {
      user: user,
    });
  });
});

app.post("/profile-upload", upload.single('image'), (req, res) => {

  console.log(req.file);
  users.findOneAndUpdate(
    { uid: currUser },
    {
      $push: {
        img: req.file.filename
      },
    },
    (error, success) => {
      if (error) {
        res.render("error_page");
      } else {
        res.render("success_page");
      }
    }
  );
});





// Profile image
// app.get("/profile-upload", isLoggedIn, (req, res) => {
//   users.findOne({ uid: currUser }, (err, user) => {
//     res.render("./registration_forms/profileImage", {
//       user: user,
//     });
//   });
// });

// app.post('/profile-upload', upload.single('image'), (req, res, next) => {
//   var obj = {
//       img: {
//           data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
//           contentType: 'image/png'
//       }
//   }
//   users.create(obj, (err, item) => {
//       if (err) {
//           console.log(err);
//       }
//       else {
//           // item.save();
//           res.redirect('/');
//       }
//   });
// });







// gFg
// app.get('/profile-upload', (req, res) => {
//   imgModel.find({}, (err, items) => {
//       if (err) {
//           console.log(err);
//           res.status(500).send('An error occurred', err);
//       }
//       else {
//           res.render('./registration_forms/profileImage', { items: items });
//       }
//   });
// });

// app.post('/profile-upload', upload.single('image'), (req, res, next) => {
//   var obj = {
//       img: {
//           data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
//           contentType: 'image/png'
//       }
//   }
//   imgModel.create(obj, (err, item) => {
//       if (err) {
//           console.log(err);
//       }
//       else {
//           // item.save();
//           res.redirect('/');
//       }
//   });
// });

// // Step 7 - the GET request handler that provides the HTML UI

// app.get('/', (req, res) => {
//   imgModel.find({}, (err, items) => {
//       if (err) {
//           console.log(err);
//           res.status(500).send('An error occurred', err);
//       }
//       else {
//           res.render('imagesPage', { items: items });
//       }
//   });
// });



// Search 
app.get('/search', (req, res, next) => {
  const searchBar = req.query.search;

  // users.find({ "name": { $regex: searchBar, $options: '$i' } })
  //   .then(data => {
  //     res.send(data);
  //   })

  // users.find({ "name": { $regex: searchBar, $options: '$i' } }), (err, user) => {
  //   res.render("searchProfile", {
  //     user: user,
  //   });
  // }
  // {
  //   // res.render("searchProfile");
  //   users.findOne({ uid: currUser }, (err, user) => {
  //     res.render("profile", {
  //       user: user,
  //     });
  //   });
  // }

  // users.find({ "name": { $regex: searchBar, $options: '$i' } })
  //   .then(data => {
  //     res.send(data);
  //   })

  // users.find({ "name": { $regex: searchBar, $options: '$i' } })
  //   .then(result => {
  //     // res.render("profile", {
  //     //   user: user,
  //     // });
  //     res.send(result)
  //   })
  //   .catch(err => {
  //     res.status(404).send({ msg: err })
  //   })

  // users.find({ name: { $regex: searchBar, $options: '$i' } }, (err, result) => {
  //   if (err) {
  //     console.error(err)
  //   }
  //   else {
  //     console.log(result)
  //     res.send(result)
  //     res.render("searchProfile", {
  //       user: user,
  //     });
  //   }
  // })



  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };


  try {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    var noMatch

    if (req.query.search) {
      users.find({ $or: [{ name: regex }, { uid: regex }] }, (err, data) => {
        // users.find({ $or: [{ name: { '$regex': req.query.search } }, { uid: { '$regex': req.query.search } }] }, (err, data) => {
        if (err) {
          console.log(err);
          res.render("error_page")
        }
        else {
          if (data.length < 1) {
            noMatch = "No such student found, Please try again";
          }
          res.render('searchProfile', { data: data, noMatch: noMatch });
        }

      })
    }
    users.find({}, function (err, all) {
      if (err) {
        console.log(err);
      } else {
        res.render("searchProfile", { all: all, noMatch: noMatch });
      }
    });

  } catch (error) {
    console.log(error);
    res.render("error_page")
  }
});



