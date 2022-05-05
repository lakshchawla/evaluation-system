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
    img: String,

  },
  certificateSchema: [
    {
      title: String,
      source: String,
      sponsoringUniversity: String,
      date: { type: Date, default: Date.now }, grade: String,
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

  gradeSchema:
  {
    skillsGrade: String,
    achievementsGrade: String,
    certificatesGrade: String,
    feedback: String,
  },
});


const users = mongoose.model("users", userSchema);

module.exports = users;
