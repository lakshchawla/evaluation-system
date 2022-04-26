const mongoose = require("mongoose");

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
    class: String,

    // New
    // img:
    // {
    //   data: Buffer,
    //   contentType: String
    // }
    img: String,

  },
  certificateSchema: [
    {
      title: String,
      source: String,
      sponsoringUniversity: String,
      date: Date,
      grade: String,
      credentialID: String,
      credentialLink: String,
    },
  ],

  skillSchema: [
    {
      language: String,
      efficiency: String,
    }
  ],

  achievementSchema: [
    {
      title: String,
      description: String,
      rank: String,
    }
  ],
  verified: Boolean,
});


const users = mongoose.model("users", userSchema);

module.exports = users;
