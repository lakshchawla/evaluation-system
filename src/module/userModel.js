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


const users = mongoose.model("users", userSchema);

module.exports = users;
